// routes/message.js
import express from "express";
import {
  getMessages,
  sendMessage,
  getUserConversations,
  markAsRead
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All message routes require authentication
router.use(protect);

// Get user conversations
router.get("/conversations", getUserConversations);

// Get messages by room ID
router.get("/:roomId", getMessages);

// Send a new message
router.post("/", sendMessage);

// Mark messages as read in a room
router.put("/:roomId/read", markAsRead);

export default router;