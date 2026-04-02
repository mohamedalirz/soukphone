// routes/listing.js
import express from "express";
import { 
  createListing, 
  getListings, 
  getListingById, 
  getUserListings,
  getListingsByUserId,
  deleteListing,
  updateListing,
  toggleListingFeatured
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getListings);
router.get("/:id", getListingById);

// IMPORTANT: Specific routes must come BEFORE parameter routes
router.get("/user/my-listings", protect, getUserListings);
router.get("/user/:userId", getListingsByUserId);  // Make sure this is exported

// Protected routes
router.post("/", protect, createListing);
router.delete("/:id", protect, deleteListing);
router.put("/:id", protect, updateListing);
router.patch("/:id/featured", protect, toggleListingFeatured);

export default router;