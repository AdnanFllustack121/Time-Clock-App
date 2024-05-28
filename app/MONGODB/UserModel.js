import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isAdmin: Boolean,
    storeURL: String,
})

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;




