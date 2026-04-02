// routes/publicSponsors.js - Create this new file
import express from "express";
import Sponsor from "../models/Sponsor.js";

const router = express.Router();

// Public route - No authentication required
router.get("/", async (req, res) => {
  try {
    console.log("Fetching public sponsors...");
    const sponsors = await Sponsor.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select("name logo description website category");
    
    console.log(`Found ${sponsors.length} active sponsors`);
    
    res.json({ 
      success: true, 
      sponsors: sponsors 
    });
  } catch (error) {
    console.error("Get public sponsors error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

export default router;