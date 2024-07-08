import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import calendar from "../utils/googleCalendar.config";
import { google } from 'googleapis';
import path from "path";
import { fileURLToPath } from 'url';
import LeaveModal from "../MONGODB/LeaveModal.";


export const action = async ({ request }) => {
    const data = JSON.parse(await request.text());
    const { admin, session } = await authenticate.admin(request);

    try {
        const newLeave = new LeaveModal({
            type: data.leaveType,
            reason: data.leaveReason,
            storeURL: session.shop,
            duration: data.leaveDuration,
            startDate: data.leaveStartDate,
            endDate: data.leaveEndDate,
            createdAt: data.createdAt,
            createdBy: data.createdBy,
            status: data.leaveStatus
        });

        await newLeave.save();

        // .......... calendar event code ............
        const event = {
            'summary': `${data.employeeName} requested leave ${data.leaveEndDate ? `from ${data.leaveStartDate} to ${data.leaveEndDate}` : `on ${data.leaveStartDate}`}.`,
            'description': `Reason: ${data.leaveReason}`,
            'start': {
                'date': data.leaveStartDate,
                'timeZone': data.userTimezone,
            },
            'end': {
                'date': data.leaveEndDate ?
                    new Date(new Date(data.leaveEndDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
                    data.leaveStartDate,
                'timeZone': data.userTimezone,
            },
            'attendees': [],
            'reminders': {
                'useDefault': false,
                'overrides': [
                    { 'method': 'email', 'minutes': 24 * 60 },
                    { 'method': 'popup', 'minutes': 10 },
                ],
            },
        };

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const keyFilePath = path.resolve(__dirname, '../../calendar-events-creator-425308-9244b58d5d57.json');

        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });

        const authClient = await auth.getClient();

        const calendarId = process.env.GOOGLE_CALENDAR_ID;

        await calendar.events.insert({
            auth: authClient,
            calendarId: calendarId,
            resource: event,
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
        });
        // ............ end ............

        return json({
            message: 'Successfully applied leave',
            data: newLeave
        });
    } catch (error) {
        console.error("Error from applyLeave:", error);
        return json({ error: 'Failed server request.', message: error.message });
    }
};
