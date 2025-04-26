import express from "express";
import { endMeeting, getMeetingHistory, addMeeting, deleteMeeting } from "../controllers/Meeting.controller.js";

const router = express.Router();

// End meeting route
router.post("/:meetingId/end", endMeeting);
router.get("/history", getMeetingHistory);

// Add meeting to history
router.post("/add", addMeeting);

// Delete meeting from history
router.delete("/:meetingId", deleteMeeting);

export default router;