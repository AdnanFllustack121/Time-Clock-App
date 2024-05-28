import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import AttendanceModel from "../MONGODB/Attendance";


export const loader = async ({ params, request }) => {


    try {
        const { admin, session } = await authenticate.admin(request);

        const attendanceRecord = await AttendanceModel.find({ storeURL: session.shop, email: params.email })

        return json({
            message: 'success',
            attendanceData: attendanceRecord
        })
    } catch (error) {
        console.error("Error from attendance:", error);
        return json({ error: 'Failed server request.', message: error.message });
    }
};

