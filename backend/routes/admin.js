import express from "express";
import mongoose from "mongoose";
import { protectAdmin } from "../middleware/adminMiddleware.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Sponsor from "../models/Sponsor.js";
import PlanRequest from "../models/PlanRequest.js";

const router = express.Router();

router.use(protectAdmin);

// Stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalSponsors = await Sponsor.countDocuments();
    res.json({ totalUsers, totalListings, totalSponsors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Listings
router.get("/listings", async (req, res) => {
  try {
    const listings = await Listing.find().populate("seller", "username").sort("-createdAt");
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/listings/:id", async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/listings/:id/featured", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    listing.featured = !listing.featured;
    await listing.save();
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sponsors
router.get("/sponsors", async (req, res) => {
  try {
    const sponsors = await Sponsor.find().sort("-createdAt");
    res.json({ sponsors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/sponsors", async (req, res) => {
  try {
    const sponsor = await Sponsor.create(req.body);
    res.status(201).json({ sponsor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/sponsors/:id", async (req, res) => {
  try {
    await Sponsor.findByIdAndDelete(req.params.id);
    res.json({ message: "Sponsor deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// routes/admin.js - Update the badge endpoint
router.patch("/users/:id/badge", async (req, res) => {
  try {
    const { badge } = req.body;
    console.log("Updating badge for user:", req.params.id, "to:", badge);
    
    // Validate badge value
    if (!["normal", "trusted", "verified"].includes(badge)) {
      return res.status(400).json({ message: "Invalid badge value" });
    }
    
    // Update directly without pre-save hooks
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { badge: badge },
      { new: true, runValidators: false } // Skip validators to avoid hooks
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("Badge updated successfully:", user.badge);
    res.json({ success: true, user: { _id: user._id, badge: user.badge } });
  } catch (error) {
    console.error("Error updating badge:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/plan-requests", async (req, res) => {
  try {
    console.log("Fetching plan requests...");
    const requests = await PlanRequest.find({ status: "pending" })
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${requests.length} pending plan requests`);
    res.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching plan requests:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add endpoint to approve request
router.post("/plan-requests/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    
    const planRequest = await PlanRequest.findById(id);
    if (!planRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    if (planRequest.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }
    
    // Update user's plan
    const User = mongoose.model("User");
    const user = await User.findById(planRequest.user);
    if (user) {
      user.plan = planRequest.requestedPlan;
      await user.save();
    }
    
    // Update request status
    planRequest.status = "approved";
    planRequest.adminNote = adminNote;
    planRequest.approvedAt = new Date();
    await planRequest.save();
    
    res.json({ success: true, message: "Request approved successfully" });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add endpoint to decline request
router.post("/plan-requests/:id/decline", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    
    const planRequest = await PlanRequest.findById(id);
    if (!planRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    if (planRequest.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }
    
    planRequest.status = "declined";
    planRequest.adminNote = adminNote;
    planRequest.declinedAt = new Date();
    await planRequest.save();
    
    res.json({ success: true, message: "Request declined" });
  } catch (error) {
    console.error("Error declining request:", error);
    res.status(500).json({ message: error.message });
  }
});

// Fix subscription dates for all users
router.post("/fix-subscription-dates", async (req, res) => {
  try {
    // Find all users with premium or enterprise plan but missing dates
    const users = await User.find({
      plan: { $in: ["premium", "enterprise"] }
    });

    let fixedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      
      // Check if subscription object exists
      if (!user.subscription) {
        user.subscription = {};
        needsUpdate = true;
      }
      
      // Check and set start date
      if (!user.subscription.startDate) {
        user.subscription.startDate = new Date();
        needsUpdate = true;
      }
      
      // Check and set end date
      if (!user.subscription.endDate) {
        const endDate = new Date(user.subscription.startDate || new Date());
        const duration = user.subscription.duration || "monthly";
        
        if (duration === "monthly") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }
        
        user.subscription.endDate = endDate;
        needsUpdate = true;
      }
      
      // Set missing fields
      if (!user.subscription.plan) {
        user.subscription.plan = user.plan;
        needsUpdate = true;
      }
      
      if (!user.subscription.status) {
        user.subscription.status = "active";
        needsUpdate = true;
      }
      
      if (!user.subscription.duration) {
        user.subscription.duration = "monthly";
        needsUpdate = true;
      }
      
      if (!user.subscription.price) {
        user.subscription.price = user.plan === "premium" ? 29 : 99;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        fixedCount++;
        console.log(`Fixed dates for user: ${user.email}`);
      }
    }

    res.json({
      success: true,
      message: `Fixed subscription dates for ${fixedCount} users`,
      fixedCount
    });
  } catch (error) {
    console.error("Error fixing subscription dates:", error);
    res.status(500).json({ message: error.message });
  }
});
export default router;