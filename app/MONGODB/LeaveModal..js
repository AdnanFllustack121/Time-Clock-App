import mongoose from 'mongoose'

const LeaveModelSchema = mongoose.Schema({
    type: String,
    reason: String,
    storeURL: String,
    duration: String,
    startDate: String,
    endDate: String,
    createdAt: Date,
    createdBy: String,
    status: String
})

const LeaveModal = mongoose.models.LeaveModal || mongoose.model('LeaveModal', LeaveModelSchema)

export default LeaveModal;