// models/PlanRequest.js
import mongoose from "mongoose";

const planRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  currentPlan: {
    type: String,
    enum: ["free", "premium", "enterprise"],
    required: true
  },
  requestedPlan: {
    type: String,
    enum: ["free", "premium", "enterprise"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending"
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    enum: ["monthly", "yearly"],
    default: "monthly"
  },
  adminNote: String,
  approvedAt: Date,
  declinedAt: Date,
  expiresAt: Date
}, { timestamps: true });

export default mongoose.model("PlanRequest", planRequestSchema);