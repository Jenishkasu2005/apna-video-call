import httpStatus from "http-status";
import { Meeting } from "../models/meeting.model.js";
import { User } from "../models/User.model.js";

// End a meeting
const endMeeting = async (req, res) => {
    const { meetingId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Authentication required" });
    }
    
    try {
        // Find the meeting
        const meeting = await Meeting.findOne({ meetingcode: meetingId });
        
        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Meeting not found" });
        }
        
        // Update meeting status to ended
        meeting.status = "ended";
        await meeting.save();
        
        return res.status(httpStatus.OK).json({ message: "Meeting ended successfully" });
    } catch (error) {
        console.error("Error ending meeting:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to end meeting" });
    }
};

// Get meeting history for a user
const getMeetingHistory = async (req, res) => {
    // Extract token without the "Bearer " prefix if it exists
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
    }
    
    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Authentication required" });
    }
    
    try {
        // Find the user by token
        const user = await User.findOne({ token });
        
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }
        
        // Find all meetings for this user
        const meetings = await Meeting.find({ user_id: user._id.toString() }).sort({ date: -1 });
        
        // Format the meetings for the frontend
        const formattedMeetings = meetings.map(meeting => ({
            meeting_code: meeting.meetingcode,
            timestamp: meeting.date,
            status: meeting.status || 'active',
            created_by: meeting.user_id // This allows frontend to check if user is owner
        }));
        
        return res.status(httpStatus.OK).json({ 
            history: formattedMeetings 
        });
    } catch (error) {
        console.error("Error fetching meeting history:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Failed to fetch meeting history",
            error: error.message
        });
    }
};

// Add a meeting to history
const addMeeting = async (req, res) => {
    const { meeting_code } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Authentication required" });
    }
    
    try {
        // Find the user by token
        const user = await User.findOne({ token });
        
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }
        
        // Check if meeting already exists for this user
        const existingMeeting = await Meeting.findOne({ 
            user_id: user._id.toString(),
            meetingcode: meeting_code
        });
        
        if (existingMeeting) {
            // If meeting exists, update its timestamp to show it was accessed again
            existingMeeting.date = new Date();
            await existingMeeting.save();
            
            return res.status(httpStatus.OK).json({ 
                message: "Meeting already in history, timestamp updated",
                meeting: existingMeeting
            });
        }
        
        // Create new meeting record
        const newMeeting = new Meeting({
            user_id: user._id.toString(),
            meetingcode: meeting_code,
            date: new Date(),
            status: 'active'
        });
        
        await newMeeting.save();
        
        return res.status(httpStatus.CREATED).json({
            message: "Meeting added to history",
            meeting: newMeeting
        });
    } catch (error) {
        console.error("Error adding meeting:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Failed to add meeting to history",
            error: error.message
        });
    }
};

// Delete a meeting from history
const deleteMeeting = async (req, res) => {
    const { meetingId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Authentication required" });
    }
    
    try {
        // Find the user by token
        const user = await User.findOne({ token });
        
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }
        
        // First check if meeting exists
        const meeting = await Meeting.findOne({
            meetingcode: meetingId
        });

        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Meeting not found" });
        }

        // Check if user has permission to delete
        if (meeting.user_id.toString() !== user._id.toString()) {
            return res.status(httpStatus.FORBIDDEN).json({ message: "You don't have permission to delete this meeting" });
        }

        // Delete the meeting
        await Meeting.findOneAndDelete({
            meetingcode: meetingId,
            user_id: user._id.toString()
        });
        
        
        return res.status(httpStatus.OK).json({ message: "Meeting deleted successfully" });
    } catch (error) {
        console.error("Error deleting meeting:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Failed to delete meeting",
            error: error.message
        });
    }
};

// Save meeting summary
export { endMeeting, getMeetingHistory, addMeeting, deleteMeeting };