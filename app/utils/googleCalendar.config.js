import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config()

const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY,
    process.env.SCOPES
);

const calendar = google.calendar({
    version: 'v3',
    project: process.env.GOOGLE_PROJECT_NUMBER,
    auth: jwtClient
});

export default calendar



