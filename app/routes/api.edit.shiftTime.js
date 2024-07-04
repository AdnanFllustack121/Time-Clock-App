import AttendanceModel from "../MONGODB/Attendance";

export async function action({ request }) {
    const payload = JSON.parse(await request.text());
    const { id, in_time, out_time, type } = payload;

    try {
        if (type == "all") {
            await AttendanceModel.findOneAndUpdate({ _id: id }, { in_time, out_time });
        } else {
            await AttendanceModel.findOneAndUpdate({ _id: id }, { in_time });
        }
        return new Response(JSON.stringify({ success: true, message: "Updated Shift Timings Successfully" }), { status: 200 });
    } catch (error) {
        console.log("Action Error", error);
        return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), { status: 500 });
    }
}