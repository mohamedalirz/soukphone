// controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    console.log("=== REGISTRATION REQUEST ===");
    console.log("Body:", req.body);
    
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        msg: "All fields are required"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ msg: "Email already registered" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ msg: "Username already taken" });
      }
    }

    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user - generate userID manually
    const user = new User({
      username,
      email,
      password: hashedPassword,
      userID: `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    await user.save();
    
    console.log("User created successfully:", user._id);

    // Generate token
    const token = generateToken(user._id);

    // Return response
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
      plan: user.plan,
      isVerified: user.isVerified
    });
    
  } catch (error) {
    console.error("Registration error details:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ msg: `${field} already exists` });
    }
    
    res.status(500).json({ 
      msg: "Server error during registration", 
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    console.log("=== LOGIN REQUEST ===");
    console.log("Email:", req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log("Login successful:", user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
      plan: user.plan,
      isVerified: user.isVerified
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      msg: "Server error during login",
      error: error.message 
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (req.body.username && req.body.username !== user.username) {
      const usernameExists = await User.findOne({ username: req.body.username });
      if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ msg: "Username already taken" });
      }
      user.username = req.body.username;
    }

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ msg: "Email already taken" });
      }
      user.email = req.body.email;
    }
    
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ msg: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/auth/user/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    Get users by badge type
export const getUsersByBadge = async (req, res) => {
  try {
    const { badge } = req.params;
    const users = await User.find({ badge })
      .select("username email badge plan rating totalSales createdAt")
      .limit(20)
      .sort({ createdAt: -1 });
    
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users by badge:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// @desc    Update user badge (admin only)
export const updateUserBadge = async (req, res) => {
  try {
    const { userId, badge } = req.body;
    
    if (!["normal", "trusted", "verified"].includes(badge)) {
      return res.status(400).json({ msg: "Invalid badge type" });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { badge },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user badge:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};