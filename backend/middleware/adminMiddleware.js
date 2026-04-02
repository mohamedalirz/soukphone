import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protectAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const admin = (req, res, next) => {
  console.log("Admin middleware - checking user:", req.user);
  console.log("Admin middleware - isAdmin:", req.user?.isAdmin);
  
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    console.log("Admin access denied - user is not admin");
    res.status(403).json({ message: "Admin access required" });
  }
};