// controllers/messageController.js
import Message from "../models/Message.js";
import User from "../models/User.js";

// Get messages by room ID
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const messages = await Message.find({ roomId })
      .populate("senderId", "username email")
      .populate("receiverId", "username email")
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { roomId, receiverId, text } = req.body;
    const senderId = req.user._id;
    
    const message = await Message.create({
      roomId,
      senderId,
      receiverId,
      text
    });
    
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "username email")
      .populate("receiverId", "username email");
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Get user conversations
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all unique roomIds where user participated
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $group: {
          _id: "$roomId",
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiverId", userId] },
                  { $eq: ["$read", false] }
                ] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);
    
    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.lastMessage.senderId.toString() === userId.toString()
          ? conv.lastMessage.receiverId
          : conv.lastMessage.senderId;
        
        const otherUser = await User.findById(otherUserId).select("username email");
        
        return {
          roomId: conv._id,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          otherUser
        };
      })
    );
    
    res.json(populatedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    
    await Message.updateMany(
      {
        roomId,
        receiverId: userId,
        read: false
      },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );
    
    res.json({ msg: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};