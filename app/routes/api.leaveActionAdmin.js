import { authenticate } from "../shopify.server"
import { json } from "@remix-run/node"
// import LeaveModal from "../MONGODB/LeaveModal."
// import userModel from "../MONGODB/UserModel"
import prisma from "../db.server"

export const action = async ({ request }) => {
    const data = JSON.parse(await request.text())

    try {

        // const updatedData = await LeaveModal.findOneAndUpdate({
        //     _id: data.actionID
        // }, {
        //     status: data.status
        // }, {
        //     new: true
        // })

        const updatedData = await prisma.leaves.update({
            where: { id: data.actionID },
            data: { status: data.status }
        });

        // const userData = await userModel.findOne({ email: updatedData.createdBy })
        const userData = await prisma.users.findFirst({ where: { email: updatedData.createdBy } });

        if (updatedData) {
            return json(({
                data: updatedData,
                message: data.status === 'Approved' ? `${userData.firstName} ${userData.lastName} leave has been approved successfully` :
                    `${userData.firstName} ${userData.lastName} leave has been rejected successfully`
            }))
        } else {
            return json({
                message: "Something went wrong while updating status of leave."
            })
        }

    } catch (error) {
        console.log('error occured on leaveActionAdmin', error);
        return json({
            message: 'error occured while a leaveActionAdmin request',
            error: error
        })

    }

}