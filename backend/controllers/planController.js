// controllers/planController.js
import PlanRequest from "../models/PlanRequest.js";
import User from "../models/User.js";
import { activateSubscription } from "./subscriptionController.js";

// Plan prices
const PLAN_PRICES = {
  premium: { monthly: 29, yearly: 290 },
  enterprise: { monthly: 99, yearly: 990 }
};

// Submit plan upgrade request
export const submitPlanRequest = async (req, res) => {
  try {
    const { requestedPlan, duration, currentPlan } = req.body;
    const userId = req.user._id;

    // Check if user already has a pending request
    const existingRequest = await PlanRequest.findOne({
      user: userId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ msg: "You already have a pending request" });
    }

    // Calculate price
    const price = PLAN_PRICES[requestedPlan]?.[duration];
    if (!price) {
      return res.status(400).json({ msg: "Invalid plan or duration" });
    }

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const planRequest = await PlanRequest.create({
      user: userId,
      currentPlan,
      requestedPlan,
      duration,
      price,
      expiresAt
    });

    res.status(201).json({
      success: true,
      msg: "Plan upgrade request submitted successfully",
      request: planRequest
    });
  } catch (error) {
    console.error("Submit plan request error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Get pending requests for admin
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await PlanRequest.find({ status: "pending" })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Get user's plan requests
export const getUserPlanRequests = async (req, res) => {
  try {
    const requests = await PlanRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    console.error("Get user requests error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Check if user has pending request
export const checkPendingRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const pendingRequest = await PlanRequest.findOne({
      user: userId,
      status: "pending"
    });

    res.json({ hasPending: !!pendingRequest });
  } catch (error) {
    console.error("Check pending request error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const approvePlanRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNote } = req.body;

    const planRequest = await PlanRequest.findById(requestId);
    if (!planRequest) {
      return res.status(404).json({ msg: "Request not found" });
    }

    if (planRequest.status !== "pending") {
      return res.status(400).json({ msg: "Request already processed" });
    }

    // Calculate subscription dates - ALWAYS set these
    const startDate = new Date();
    const endDate = new Date();
    
    if (planRequest.duration === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planRequest.duration === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
    }

    console.log("Setting subscription dates:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: planRequest.duration,
      plan: planRequest.requestedPlan
    });

    // Update user with complete subscription data
    const user = await User.findById(planRequest.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Set the complete subscription object with dates
    user.plan = planRequest.requestedPlan;
    user.subscription = {
      plan: planRequest.requestedPlan,
      startDate: startDate,
      endDate: endDate,
      status: "active",
      autoRenew: false,
      price: planRequest.price,
      duration: planRequest.duration
    };
    
    await user.save();

    // Update request status
    planRequest.status = "approved";
    planRequest.adminNote = adminNote;
    planRequest.approvedAt = new Date();
    await planRequest.save();

    res.json({
      success: true,
      msg: `Plan upgraded to ${planRequest.requestedPlan} until ${endDate.toLocaleDateString()}`,
      user: {
        _id: user._id,
        username: user.username,
        plan: user.plan,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Decline plan request (Admin only)
export const declinePlanRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNote } = req.body;

    const planRequest = await PlanRequest.findById(requestId);
    if (!planRequest) {
      return res.status(404).json({ msg: "Request not found" });
    }

    if (planRequest.status !== "pending") {
      return res.status(400).json({ msg: "Request already processed" });
    }

    planRequest.status = "declined";
    planRequest.adminNote = adminNote;
    planRequest.declinedAt = new Date();
    await planRequest.save();

    res.json({
      success: true,
      msg: `Plan request declined`
    });
  } catch (error) {
    console.error("Decline request error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Get all plan requests (Admin only)
export const getAllPlanRequests = async (req, res) => {
  try {
    const requests = await PlanRequest.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    console.error("Get all requests error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};