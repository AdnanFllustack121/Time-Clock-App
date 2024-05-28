import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
console.log('token_key...', process.env.TOKEN_KEY);
export const createSecretToken = (id) => {
    if (!process.env.TOKEN_KEY) {
        throw new Error('TOKEN_KEY is not defined in the environment variables.');
    }

    try {
        return jwt.sign({ id }, process.env.TOKEN_KEY, {
            expiresIn: 3 * 24 * 60 * 60,
        });
    } catch (error) {
        console.error('Error creating token:', error);
        throw new Error('Unable to create token.');
    }
};

