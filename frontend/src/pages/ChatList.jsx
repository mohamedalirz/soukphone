// pages/ChatList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserConversations, markMessagesAsRead } from "../services/api";

// Simple time formatting function - no external dependencies
const formatTimeAgo = (date) => {
  if (!date) return "";
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks}w ago`;
  }
  
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months}mo ago`;
  }
  
  const years = Math.floor(diffInDays / 365);
  return `${years}y ago`;
};

const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getUserConversations();
      setConversations(data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = async (roomId) => {
    try {
      await markMessagesAsRead(roomId);
      setConversations(prev =>
        prev.map(conv =>
          conv.roomId === roomId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          No messages yet
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Start a conversation by contacting a seller from a listing
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <h1 className="text-xl font-bold text-white">Messages</h1>
        <p className="text-white/80 text-sm">Your conversations</p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {conversations.map((conv) => (
          <Link
            key={conv.roomId}
            to={`/chat/${conv.otherUser?._id}`}
            onClick={() => handleConversationClick(conv.roomId)}
            className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <div className="p-4 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {conv.otherUser?.username?.[0]?.toUpperCase() || "?"}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {conv.otherUser?.username || "Unknown User"}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                    {formatTimeAgo(conv.lastMessage?.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                  {conv.lastMessage?.senderId?._id === conv.otherUser?._id 
                    ? `${conv.otherUser?.username}: ` 
                    : "You: "}
                  {conv.lastMessage?.text || "No messages"}
                </p>
              </div>
              
              {/* Unread Badge */}
              {conv.unreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center">
                  {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatList;