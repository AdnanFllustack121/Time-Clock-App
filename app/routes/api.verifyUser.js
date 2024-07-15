import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
// import userModel from "../MONGODB/UserModel";
import jwt from "jsonwebtoken";
import prisma from "../db.server";

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
    let isUserDocEmpty;

    try {
        const { admin, session } = await authenticate.admin(request);

        const count = await prisma.users.findMany();
        // const count = await userModel.countDocuments({});

        if (count.length > 0) {
            isUserDocEmpty = false
        } else {
            isUserDocEmpty = true
        }

        if (!token || token === "" || token === undefined) {
            return json({ status: false, isUserDocEmpty });
        }

        try {
            const decoded = await verifyToken(token, process.env.TOKEN_KEY);

            // const user = await userModel.findById(decoded.id);
            const user = await prisma.users.findFirst({ where: { id: decoded.id } });

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
