import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import AttendanceModel from "../MONGODB/Attendance";


export const loader = async ({ params, request }) => {
    console.log('params from getAttendance', params);
    console.log('new date', new Date(params.todaysDate));

    try {
        const { admin, session } = await authenticate.admin(request);

        let attendanceRecord;

        if (params.email !== 'false') {


            const gotData = await AttendanceModel.find({
                storeURL: session.shop,
                email: params.email,
            });

            attendanceRecord = gotData.filter((d, i) => {
                console.log('new Date(d.out_time).toLocaleDateString()', d.out_time?.toLocaleDateString());
                console.log('new Date(params.todaysDate)', new Date(params.todaysDate)?.toLocaleDateString());
                if (d.out_time === null) {
                    return d
                }
                else if (d.out_time.toLocaleDateString() === new Date(params.todaysDate).toLocaleDateString()) {
                    return d
                }
            })

        } else {
            console.log('hit else getAttendance');
            // attendanceRecord = await AttendanceModel.find({
            //     storeURL: session.shop,
            // });

            attendanceRecord = await AttendanceModel.aggregate([
                {
                    $lookup:
                    {
                        from: "users",
                        localField: "email",
                        foreignField: "email",
                        as: "userDetails"
                    }
                }
            ])

            console.log('attendanceRecord from getAttendance of all', attendanceRecord[0].userDetails);
        }


        return json({
            message: 'success',
            attendanceData: attendanceRecord
        })
    } catch (error) {
        console.error("Error from attendance:", error);
        return json({ error: 'Failed server request.', message: error.message });
    }
};

