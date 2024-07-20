import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
// import LeaveModal from "../MONGODB/LeaveModal.";
import prisma from "../db.server";

export const action = async ({ request }) => {
    const data = JSON.parse(await request.text())

    try {
        const { admin, session } = await authenticate.admin(request);

        let message;
        let updatedLeave;
        if (data.type === 'edit') {
            // updatedLeave = await LeaveModal.findOneAndUpdate({ _id: data.actionID }, {
            //     type: data.leaveType,
            //     reason: data.leaveReason,
            //     storeURL: session.shop,
            //     duration: data.leaveDuration,
            //     startDate: data.leaveStartDate,
            //     endDate: data.leaveEndDate,
            //     createdAt: data.createdAt,
            //     createdBy: data.createdBy,
            //     status: data.leaveStatus
            // }, {
            //     new: true
            // });

            updatedLeave = await prisma.leaves.update({
                where: {
                    id: data.actionID
                },
                data: {
                    type: data.leaveType,
                    reason: data.leaveReason,
                    storeURL: session.shop,
                    duration: data.leaveDuration,
                    startDate: new Date(data.leaveStartDate),
                    endDate: data.leaveEndDate != null ? data.leaveEndDate != "" ? new Date(data.leaveEndDate) : null : null,
                    createdAt: data.createdAt,
                    createdBy: data.createdBy,
                    status: data.leaveStatus
                }
            });

            message = 'Your leave has been updated successfully.'

        } else {
            // updatedLeave = await LeaveModal.findOneAndDelete({ _id: data.actionID });
            updatedLeave = await prisma.leaves.delete({ where: { id: data.actionID } });
            message = 'Your leave has been deleted successfully.'

        }

        return json({
            message,
            data: updatedLeave
        })
    } catch (error) {
        console.error("Error on leave action:", error);
        return json({ error: 'Failed on leave action.', message: error.message });
    }
};

