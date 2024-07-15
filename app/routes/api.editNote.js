import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
// import AttendanceModel from "../MONGODB/Attendance";
import prisma from "../db.server";

export const action = async ({ request }) => {
    const data = JSON.parse(await request.text())

    try {
        const { admin, session } = await authenticate.admin(request);

        // const attendanceData = await AttendanceModel.findOneAndUpdate({ _id: data.idToUpdate }, {
        //     note: data.note
        // }, { new: true })

        const attendanceData = await prisma.attendance.update({
            where: { id: data.idToUpdate },
            data: { note: data.note }
        });

        return json({
            message: 'Note updated successfully',
            attendanceData
        })

    } catch (error) {
        console.error("Error editing note:", error);
        return json({ error: 'Failed to edit note.', message: error.message });
    }
};

