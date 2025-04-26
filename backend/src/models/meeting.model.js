import mongoose, { Schema } from "mongoose";

const meetignSchema = new Schema(
    {
        user_id: { type: String },
        meetingcode: { type: String, require: true },
        date: { type: Date, default: Date.now, require: true },
        status: { type: String, enum: ['active', 'ended'], default: 'active' }
    }
)

const Meeting = mongoose.model("Meeting", meetignSchema);

export { Meeting };