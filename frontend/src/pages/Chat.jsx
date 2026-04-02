// pages/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import io from "socket.io-client";
import { getMessages, sendMessage, getUserById, markMessagesAsRead } from "../services/api";
import { ArrowLeft } from "lucide-react";

const Chat = () => {
  const { id } = useParams(); // Other user ID
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  // Fetch other user details
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (id && currentUser) {
        try {
          console.log("Fetching user with ID:", id);
          const user = await getUserById(id);
          setOtherUser(user);
        } catch (error) {
          console.error("Error fetching user:", error);
          alert("User not found");
          navigate("/chat");
        }
      }
    };
    fetchOtherUser();
  }, [id, currentUser, navigate]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!currentUser || !otherUser) return;

    // Create room ID (combine both user IDs sorted)
    const roomId = [currentUser._id, otherUser._id].sort().join("-");
    
    // Connect to Socket.IO
    const newSocket = io("http://localhost:5000", {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    setSocket(newSocket);
    
    // Join room
    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      newSocket.emit("joinRoom", roomId);
    });
    
    // Listen for messages
    newSocket.on("receiveMessage", (message) => {
      console.log("New message received:", message);
      setMessages((prev) => [...prev, message]);
      
      // Mark messages as read when received
      if (message.senderId?._id !== currentUser._id && message.senderId !== currentUser._id) {
        markMessagesAsRead(roomId).catch(console.error);
      }
    });
    
    // Listen for typing indicator
    newSocket.on("userTyping", (data) => {
      if (data.userId === otherUser._id) {
        setOtherUserTyping(data.isTyping);
      }
    });
    
    // Handle reconnection
    newSocket.on("reconnect", () => {
      console.log("Reconnected to Socket.IO");
      newSocket.emit("joinRoom", roomId);
    });
    
    // Handle errors
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    
    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getMessages(roomId);
        setMessages(data);
        
        // Mark messages as read
        if (data.length > 0) {
          await markMessagesAsRead(roomId);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Cleanup
    return () => {
      if (newSocket) {
        newSocket.emit("leaveRoom", roomId);
        newSocket.disconnect();
      }
    };
  }, [currentUser, otherUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !currentUser || !otherUser) return;
    
    const roomId = [currentUser._id, otherUser._id].sort().join("-");
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        roomId,
        userId: currentUser._id,
        isTyping: true
      });
    }
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing", {
        roomId,
        userId: currentUser._id,
        isTyping: false
      });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !currentUser || !otherUser) return;
    
    const roomId = [currentUser._id, otherUser._id].sort().join("-");
    
    const messageData = {
      roomId,
      receiverId: otherUser._id,
      text: newMessage
    };
    
    try {
      const savedMessage = await sendMessage(messageData);
      
      socket.emit("sendMessage", {
        roomId,
        message: savedMessage
      });
      
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage("");
      
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading chat...</div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">User not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center gap-3">
          <Link to="/chat" className="text-white hover:text-white/80 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl font-bold">{otherUser.username?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg text-white">{otherUser.username}</h2>
              {otherUserTyping && (
                <p className="text-xs text-white/80">Typing...</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSender = msg.senderId?._id === currentUser?._id || msg.senderId === currentUser?._id;
            return (
              <div
                key={idx}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    isSender
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;