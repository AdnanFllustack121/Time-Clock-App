import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import shopModel from "../MONGODB/ShopModel";
import userModel from "../MONGODB/UserModel";
import bcrypt from "bcrypt";
import { createSecretToken } from "../components/authentications/createSecretToken";
// import { createCookie } from "../components/authentications/createCookie";

export const action = async ({ request }) => {
    const data = JSON.parse(await request.text())
    const { email, password, firstName, lastName, isAdmin } = data
    console.log('data get from signup', {
        email,
        password,
        firstName,
        lastName
    })


    try {
        const { admin, session } = await authenticate.admin(request);
        // const cookieHeader = request.headers.get("Cookie");
        // console.log('cookieHeader', cookieHeader)
        // const cookieGot =
        //     (await createCookie.parse(cookieHeader)) || {};
        // console.log('cookieGot', cookieGot)


        console.log('session.shop of api signup.............', session.shop);

        const userFound = await userModel.findOne({ email }).exec();

        if (userFound) {
            return json({
                message: 'User already exist!',
                status: 400
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        console.log('hashedPassword', hashedPassword);

        const newUser = new userModel({ email, password: hashedPassword, firstName, lastName, isAdmin, storeURL: session.shop });
        await newUser.save();


        // const newCookie = await createCookie.serialize(cookieGot);

        // return json(
        //     {
        //         message: 'You have signed up successfully!',
        //     },
        //     {
        //         status: 201,
        //         headers: {
        //             "Set-Cookie": newCookie,
        //         },
        //     }
        // );

        const token = await createSecretToken(newUser._id);

        console.log('token', token)


        return json({
            message: 'You have signed up successfully!',
            token,
            user: newUser
        })


    } catch (error) {
        console.error("Error parsing JSON:", error);
        return json({ error: 'Failed to parse JSON from the request body.', message: error.message });
    }
};

