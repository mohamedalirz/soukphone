// models/Sponsor.js
import mongoose from "mongoose";

const sponsorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Sponsor name is required"],
    unique: true,
    trim: true,
    maxlength: [100, "Sponsor name cannot exceed 100 characters"]
  },
  logo: {
    type: String,
    required: [true, "Sponsor logo is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxlength: [200, "Description cannot exceed 200 characters"]
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, "Please enter a valid URL"]
  },
  category: {
    type: String,
    enum: ["electronics", "accessories", "repair", "delivery", "payment", "other"],
    default: "other"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  contactPhone: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create index for better query performance
sponsorSchema.index({ isActive: 1, displayOrder: 1 });
sponsorSchema.index({ category: 1 });
sponsorSchema.index({ featured: 1 });

export default mongoose.model("Sponsor", sponsorSchema);