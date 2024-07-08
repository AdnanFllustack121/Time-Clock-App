import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import bcrypt from "bcrypt";
import md5 from "md5";
import userModel from "../MONGODB/UserModel";
import { createSecretToken } from "../components/authentications/createSecretToken";


export const action = async ({ request }) => {
    const data = JSON.parse(await request.text())
    const { email, password } = data
    
    try {
        const { admin, session } = await authenticate.admin(request);


        const userFound = await userModel.findOne({ email: email }).exec();

        if (!userFound) {
            return json({ message: "You are not registered.", error: true, status: false });
        }

        if (password && userFound.password) {
            const match = await bcrypt.compare(
                password,
                userFound.password.replace("$2y$", "$2a$")
            );

            const matchMd5 = userFound.password.replace("$2y$", "$2a$") === md5(password);


            if (match || matchMd5) {

                const token = await createSecretToken(userFound._id);

                return json({ message: "You are logged in successfully", error: false, user: userFound, token, status: true });
            } else {
                return json({ message: "Please enter correct password", error: true, status: false });
            }
        } else {
            return json({ message: "Invalid request", error: true, status: false });
        }


    } catch (error) {
        console.error("Error parsing JSON:", error);
        return json({ error: 'Failed to parse JSON from the request body.', message: error.message });
    }
};

