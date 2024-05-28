import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    in_time: {
        type: String,
        required: true
    },
    out_time: {
        type: String,
        default: null
    },
    note: {
        type: String,
        default: null
    },
    status: {
        type: String,
        required: true
    },
    storeURL: String,

})

const AttendanceModel = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema)

export default AttendanceModel;
