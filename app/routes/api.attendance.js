import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import AttendanceModel from "../MONGODB/Attendance";


export const action = async ({ request }) => {
    const data = JSON.parse(await request.text())
    console.log('data from attendance', data);


    try {
        const { admin, session } = await authenticate.admin(request);

        let attendanceRecord;
        if (data.status === 'incomplete') {

            attendanceRecord = new AttendanceModel({
                email: data.email,
                in_time: data.in_time,
                status: data.status,
                storeURL: session.shop,
            })

            await attendanceRecord.save()
        } else {
            attendanceRecord = await AttendanceModel.findOneAndUpdate({
                _id: data.idToUpdate
            }, {
                out_time: data.out_time,
                note: data.note,
                status: data.status
            },
                { new: true }
            )
        }

        console.log('attendanceRecord', attendanceRecord);


        return json({
            message: 'success',
            attendanceData: attendanceRecord
        })
    } catch (error) {
        console.error("Error from attendance:", error);
        return json({ error: 'Failed server request.', message: error.message });
    }
};

