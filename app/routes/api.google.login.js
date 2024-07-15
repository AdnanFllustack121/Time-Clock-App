import { jwtDecode } from "jwt-decode";
// import userModel from "../MONGODB/UserModel";
import { authenticate } from "../shopify.server";
import { createSecretToken } from "../components/authentications/createSecretToken";
import prisma from "../db.server";

export async function action({ request }) {
    const payload = JSON.parse(await request.text());
    const { credential } = payload;
    const { session } = await authenticate.admin(request);

    try {
        const user_data = jwtDecode(credential);

        // const userFound = await userModel.findOne({ email: user_data.email }).exec();
        const userFound = await prisma.users.findFirst({ where: { email: user_data.email } });

        if (!userFound) {
            const newUser = await prisma.users.create({
                data: {
                    firstName: user_data.given_name,
                    lastName: user_data.family_name,
                    email: user_data.email,
                    contact: "",
                    password: "",
                    isAdmin: false,
                    isSuperAdmin: false,
                    storeURL: session.shop
                }
            });
            
            // const newUser = new userModel({
            //     firstName: user_data.given_name,
            //     lastName: user_data.family_name,
            //     email: user_data.email,
            //     contact: "",
            //     password: "",
            //     isAdmin: false,
            //     isSuperAdmin: false,
            //     storeURL: session.shop,
            // });
            // await newUser.save();

            const token = await createSecretToken(newUser.id);

            return new Response(JSON.stringify({
                message: 'You have signed up successfully!',
                token,
                status: true,
                user: newUser
            }), { status: 200 });
        }

        const token = await createSecretToken(userFound.id);

        return new Response(JSON.stringify({
            message: "You are logged in successfully",
            error: false,
            user: userFound,
            token,
            status: true
        }), { status: 200 });
    } catch (error) {
        console.log("Action Error", error);
        return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), { status: 500 });
    }
}