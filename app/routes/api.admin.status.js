import prisma from "../db.server";
// import userModel from "../MONGODB/UserModel";

export async function action({ request }) {
    const payload = JSON.parse(await request.text());
    const { type, userId } = payload;
    try {
        if (type == "assignAdmin") {
            // await userModel.findOneAndUpdate({ _id: userId }, { isAdmin: true });
            await prisma.users.update({ where: { id: userId }, data: { isAdmin: true } });
            return new Response(JSON.stringify({ success: true, message: "Admin status added Successfully." }), { status: 200 });
        } else {
            // await userModel.findOneAndUpdate({ _id: userId }, { isAdmin: false });
            await prisma.users.update({ where: { id: userId }, data: { isAdmin: false } });
            return new Response(JSON.stringify({ success: true, message: "Admin status revoked Successfully." }), { status: 200 });
        }

    } catch (error) {
        console.log("Action Error", error);
        return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), { status: 500 });
    }
}