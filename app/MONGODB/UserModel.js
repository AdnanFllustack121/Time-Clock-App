import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    contact: String,
    password: String,
    isSuperAdmin: Boolean,
    isAdmin: Boolean,
    storeURL: String,
})

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;




