// routes/plan.js
import express from "express";
import {
  submitPlanRequest,
  getPendingRequests,
  getUserPlanRequests,
  checkPendingRequest,
  approvePlanRequest,
  declinePlanRequest,
  getAllPlanRequests
} from "../controllers/PlanController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============ USER ROUTES (require authentication) ============

// Submit a plan upgrade request
router.post("/request", protect, submitPlanRequest);

// Get current user's plan requests
router.get("/my-requests", protect, getUserPlanRequests);

// Check if user has pending request (public for profile check)
router.get("/requests/pending/:userId", checkPendingRequest);


// ============ ADMIN ROUTES (require authentication + admin role) ============

// Get all pending requests (admin only)
router.get("/pending", protect, admin, getPendingRequests);

// Get all plan requests (admin only)
router.get("/all", protect, admin, getAllPlanRequests);

// Approve a plan request (admin only)
router.post("/approve/:requestId", protect, admin, approvePlanRequest);

// Decline a plan request (admin only)
router.post("/decline/:requestId", protect, admin, declinePlanRequest);


// ============ TEST ROUTE (for debugging) ============
router.get("/test-auth", protect, admin, (req, res) => {
  res.json({ 
    success: true, 
    message: "Admin authentication working", 
    admin: req.admin 
  });
});

export default router;