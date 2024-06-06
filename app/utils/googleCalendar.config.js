import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config()

// console.log('GOOGLE_CLIENT_EMAIL', process.env.GOOGLE_CLIENT_EMAIL);
// console.log('GOOGLE_PRIVATE_KEY', process.env.GOOGLE_PRIVATE_KEY);
// console.log('GOOGLE_PROJECT_NUMBER', process.env.GOOGLE_PROJECT_NUMBER);

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



