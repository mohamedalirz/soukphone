// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listing.js";
import messageRoutes from "./routes/message.js";
import uploadRoutes from "./routes/upload.js";
import publicSponsorsRoutes from "./routes/publicSponsors.js";
import adminRoutes from "./routes/admin.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import planRoutes from "./routes/plan.js";
import subscriptionRoutes from "./routes/subscription.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://soukphone.vercel.app',
  'https://soukphone-git-main.vercel.app',
  'https://soukphone.vercel.app',
  'https://soukphone-api.onrender.com',
  'https://soukphone-rdt2k67ol-dalis-projects-6f904fe4.vercel.app'
];

// Configure CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(null, true); // Allow anyway for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

app.set('io', io);

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "SoukPhone API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server is running!", 
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      listings: "/api/listings",
      sponsors: "/api/sponsors",
      plans: "/api/plans",
      admin: "/api/admin"
    }
  });
});

// Rate limiting (only in production)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { msg: "Too many requests, please try again later." }
  });
  app.use("/api/", limiter);
}

// Routes
app.use("/api/sponsors", publicSponsorsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);
  
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });
  
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });
  
  socket.on("sendMessage", (data) => {
    const { roomId, message } = data;
    console.log(`Message sent to room ${roomId}`);
    io.to(roomId).emit("receiveMessage", message);
  });
  
  socket.on("typing", (data) => {
    const { roomId, userId, isTyping } = data;
    socket.to(roomId).emit("userTyping", { userId, isTyping });
  });
  
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ msg: "Something went wrong!", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: `Route ${req.url} not found` });
});

// Database connection
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected");
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Server running on port ${PORT}`);
      console.log(`🔌 Socket.IO server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err.message);
    // Don't exit, just log error
    console.log("Starting server without DB connection...");
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Server running on port ${PORT} (without DB)`);
    });
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
