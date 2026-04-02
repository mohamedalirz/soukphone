// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  
  console.log("Auth middleware - Headers:", req.headers);
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token.substring(0, 20) + "...");
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");
      console.log("User found:", req.user ? req.user.username : "No user found");
      
      if (!req.user) {
        return res.status(401).json({ msg: "User not found" });
      }
      
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401).json({ msg: "Invalid token", error: error.message });
    }
  } else {
    console.log("No authorization header or invalid format");
  }
  
  if (!token) {
    res.status(401).json({ msg: "No token, authorization denied" });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ msg: "Admin access required" });
  }
};