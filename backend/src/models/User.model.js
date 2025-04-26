import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, require: true },
        username: { type: String, require: true, unique: true },
        password: { type: String, require: true },
        token: { type: String }
    }
)

const User = mongoose.model("User", UserSchema);
export { User };