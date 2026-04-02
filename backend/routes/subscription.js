// routes/subscription.js
import express from "express";
import {
  getSubscriptionStatus,
  toggleAutoRenew,
  adminUpdateSubscription
} from "../controllers/subscriptionController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.get("/status", protect, getSubscriptionStatus);
router.post("/toggle-auto-renew", protect, toggleAutoRenew);

// Admin routes
router.post("/admin/update", protect, admin, adminUpdateSubscription);

export default router;