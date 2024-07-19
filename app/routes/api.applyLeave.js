import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import calendar from "../utils/googleCalendar.config";
import { google } from 'googleapis';
import path from "path";
import { fileURLToPath } from 'url';
// import LeaveModal from "../MONGODB/LeaveModal.";
import prisma from "../db.server";


export const action = async ({ request }) => {
    const data = JSON.parse(await request.text());
    const { admin, session } = await authenticate.admin(request);

    try {

        const newLeave = await prisma.leaves.create({
            data: {
                type: data.leaveType,
                reason: data.leaveReason,
                storeURL: session.shop,
                duration: data.leaveDuration,
                startDate: data.leaveStartDate,
                endDate: data.leaveEndDate == "" ? null : data.leaveEndDate,
                createdAt: data.createdAt,
                createdBy: data.createdBy,
                status: data.leaveStatus
            }
        });

        // const newLeave = new LeaveModal({
        //     type: data.leaveType,
        //     reason: data.leaveReason,
        //     storeURL: session.shop,
        //     duration: data.leaveDuration,
        //     startDate: data.leaveStartDate,
        //     endDate: data.leaveEndDate,
        //     createdAt: data.createdAt,
        //     createdBy: data.createdBy,
        //     status: data.leaveStatus
        // });

        // await newLeave.save();

        // .......... calendar event code ............

        const eventLeaveEndDate = data.leaveEndDate != "" ? String(data.leaveEndDate).split("T")[0] : "";
        const eventLeaveStartDate = String(data.leaveStartDate).split("T")[0];

        const event = {
            'summary': `${data.employeeName} requested leave ${eventLeaveEndDate ? `from ${eventLeaveStartDate} to ${eventLeaveEndDate}` : `on ${eventLeaveStartDate}`}.`,
            'description': `Reason: ${data.leaveReason}`,
            'start': {
                'date': eventLeaveStartDate,
                'timeZone': data.userTimezone,
            },
            'end': {
                'date': eventLeaveEndDate ?
                    new Date(new Date(eventLeaveEndDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
                    eventLeaveStartDate,
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
        const keyFilePath = path.resolve(__dirname, '../../midwestapi-d13d5c77f160.json');

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
