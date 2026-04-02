// routes/sponsor.js
import express from "express";
import {
  createSponsor,
  getSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
  bulkUpdateOrder,
  toggleSponsorStatus
} from "../controllers/sponsorController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getSponsors);
router.get("/:id", getSponsorById);

// Admin only routes
router.post("/", protect, admin, createSponsor);
router.put("/bulk/order", protect, admin, bulkUpdateOrder);
router.put("/:id", protect, admin, updateSponsor);
router.patch("/:id/toggle", protect, admin, toggleSponsorStatus);
router.delete("/:id", protect, admin, deleteSponsor);

export default router;