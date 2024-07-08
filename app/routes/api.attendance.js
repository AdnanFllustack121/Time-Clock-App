import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import AttendanceModel from "../MONGODB/Attendance";


export const action = async ({ request }) => {
    const data = JSON.parse(await request.text())

    try {
        const { admin, session } = await authenticate.admin(request);

        let attendanceRecord;
        let message;
        if (data.status === 'Incomplete') {

            attendanceRecord = new AttendanceModel({
                email: data.email,
                in_time: data.in_time,
                status: data.status,
                storeURL: session.shop,
            })

            await attendanceRecord.save()

            message = 'Clocked-In Successfully.'
        } else {
            attendanceRecord = await AttendanceModel.findOneAndUpdate({
                _id: data.idToUpdate
            }, {
                out_time: data.out_time,
                ...(data.note.length > 0 ? {note: data.note} : {}),
                status: data.status
            },
                { new: true }
            )

            message = 'Clocked-Out Successfully.'

        }

        return json({
            message,
            attendanceData: attendanceRecord
        })
    } catch (error) {
        console.error("Error from attendance:", error);
        return json({ error: 'Failed server request.', message: error.message });
    }
};

