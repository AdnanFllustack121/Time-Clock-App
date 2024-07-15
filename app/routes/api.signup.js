import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
// import shopModel from "../MONGODB/ShopModel";
// import userModel from "../MONGODB/UserModel";
import bcrypt from "bcrypt";
import { createSecretToken } from "../components/authentications/createSecretToken";
import prisma from "../db.server";
// import { createCookie } from "../components/authentications/createCookie";

export const action = async ({ request }) => {
    const data = JSON.parse(await request.text())
    const { email, password, firstName, lastName, isAdmin, isSuperAdmin, contact } = data

    try {
        const { admin, session } = await authenticate.admin(request);

        const userFound = await prisma.users.findFirst({ where: { email } });
        // const userFound = await userModel.findOne({ email }).exec();

        if (userFound) {
            return json({
                message: 'User already exist!',
                status: 400
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = await prisma.users.create({
            data: {
                firstName,
                lastName,
                email,
                contact,
                password: hashedPassword,
                isAdmin,
                isSuperAdmin,
                storeURL: session.shop,
            }
        });

        // const newUser = new userModel({
        //     firstName,
        //     lastName,
        //     email,
        //     contact,
        //     password: hashedPassword,
        //     isAdmin,
        //     isSuperAdmin,
        //     storeURL: session.shop,
        // });
        // await newUser.save();

        const token = await createSecretToken(newUser.id);

        return json({
            message: 'You have signed up successfully!',
            token,
            user: newUser
        });
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return json({ error: 'Failed to parse JSON from the request body.', message: error.message });
    }
};

