// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { startSubscriptionScheduler, runInitialCheck } from "./utils/subscriptionScheduler.js";

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

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

app.set('io', io);

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(helmet());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date().toISOString() });
});

// Rate limiting
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
} else {
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

// SECOND: Admin auth routes (login, setup - no auth needed)
app.use("/api/admin/auth", adminAuthRoutes);  // This should be BEFORE adminRoutes

// THIRD: Protected admin routes (require auth)
app.use("/api/admin", adminRoutes);  // This comes after

app.use("/api/plans", planRoutes);

app.use("/api/subscription", subscriptionRoutes);


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
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected")
    
    // Start subscription scheduler
    startSubscriptionScheduler();
    runInitialCheck();;
    
    // Start server only after DB connection
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🔥 Server running on http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});