import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const isValid = await bcrypt.compare(password, admin.password);
    
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};