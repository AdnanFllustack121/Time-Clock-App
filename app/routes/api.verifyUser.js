import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import userModel from "../MONGODB/UserModel";
import jwt from "jsonwebtoken";

const verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

export const action = async ({ request }) => {
    const data = JSON.parse(await request.text());
    const { token } = data;
    // console.log('data get from verifyUser', token);
    let isUserDocEmpty;

    try {
        const { admin, session } = await authenticate.admin(request);

        const count = await userModel.countDocuments({});
        if (count > 0) {
            isUserDocEmpty = false
        } else {
            isUserDocEmpty = true
        }

        // console.log('session.shop of api verifyUser.............', session.shop);

        if (!token || token === "" || token === undefined) {
            return json({ status: false, isUserDocEmpty });
        }

        // console.log('process.env.TOKEN_KEY and token.,,,..,,,..,,', process.env.TOKEN_KEY, '    ', token);

        try {
            const decoded = await verifyToken(token, process.env.TOKEN_KEY);
            const user = await userModel.findById(decoded.id);
            // console.log('user..............found........', user);

            if (user) {
                return json({ status: true, user, isUserDocEmpty });
            } else {
                return json({ status: false, message: 'User not found!', isUserDocEmpty });
            }
        } catch (error) {
            console.error('Error verifying token or finding user:', error);
            return json({ status: false, message: error.message, isUserDocEmpty });
        }

    } catch (error) {
        console.error("Error: ", error);
        return json({ error: 'Failed request.', message: error.message, isUserDocEmpty });
    }
};
