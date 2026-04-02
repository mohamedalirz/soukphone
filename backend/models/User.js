// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userID: { type: String, unique: true, sparse: true },
  username: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  plan: { 
  type: String, 
  default: "free",
  enum: ["free", "premium", "enterprise"]
},
subscription: {
    plan: { type: String, enum: ["free", "premium", "enterprise"] },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
    autoRenew: { type: Boolean, default: false },
    price: Number,
    duration: { type: String, enum: ["monthly", "yearly"] }
  },
  isVerified: { type: Boolean, default: false },
  badge: {
    type: String,
    enum: ["normal", "trusted", "verified"],
    default: "normal"
  }
}, { timestamps: true });

// NO pre-save hooks - they cause the "next is not a function" error

export default mongoose.model("User", userSchema);