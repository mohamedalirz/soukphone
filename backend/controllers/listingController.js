// controllers/listingController.js
import Listing from "../models/Listing.js";
import mongoose from "mongoose";

// Get current user's listings (for profile page)
export const getUserListings = async (req, res) => {
  try {
    console.log("Fetching listings for current user:", req.user._id);
    
    const listings = await Listing.find({ seller: req.user._id })
      .populate("seller", "username email badge rating totalSales")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${listings.length} listings for current user`);
    res.json(listings);
  } catch (error) {
    console.error("Error fetching user listings:", error);
    res.status(500).json({ msg: "Failed to fetch your listings", error: error.message });
  }
};

// Get listings by user ID (for seller profile page)
export const getListingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching listings for user ID:", userId);
    
    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }
    
    const listings = await Listing.find({ seller: userId })
      .populate("seller", "username email badge rating totalSales")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${listings.length} listings for user ${userId}`);
    res.json(listings);
  } catch (error) {
    console.error("Error fetching user listings by ID:", error);
    res.status(500).json({ msg: "Failed to fetch listings", error: error.message });
  }
};

// Get all listings
export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("seller", "username email badge rating totalSales")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ msg: "Failed to fetch listings", error: error.message });
  }
};

// Get listing by ID
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("seller", "username email badge rating totalSales");
    
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }
    
    res.json(listing);
  } catch (error) {
    console.error("Error fetching listing by ID:", error);
    res.status(500).json({ msg: "Failed to fetch listing", error: error.message });
  }
};

// Create listing
export const createListing = async (req, res) => {
  try {
    console.log("Creating listing with data:", req.body);
    
    const { title, description, price, condition, images } = req.body;
    
    if (!title || !description || !price || !condition) {
      return res.status(400).json({ 
        msg: "Missing required fields",
        required: ["title", "description", "price", "condition"]
      });
    }
    
    let processedImages = [];
    if (images && Array.isArray(images)) {
      processedImages = images.map(img => {
        if (typeof img === 'string') {
          return img;
        }
        if (img.url) {
          return img.url;
        }
        return img;
      });
    }
    
    const listing = await Listing.create({
      title,
      description,
      price: Number(price),
      condition,
      images: processedImages,
      seller: req.user._id
    });
    
    console.log("Listing created successfully:", listing._id);
    res.status(201).json(listing);
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({ 
      msg: "Failed to create listing", 
      error: error.message
    });
  }
};

// Delete listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }
    
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "You are not authorized to delete this listing" });
    }
    
    await listing.deleteOne();
    res.json({ msg: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ msg: "Failed to delete listing", error: error.message });
  }
};

// Update listing
export const updateListing = async (req, res) => {
  try {
    const { title, description, price, condition, images } = req.body;
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }
    
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "You are not authorized to update this listing" });
    }
    
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price) listing.price = price;
    if (condition) listing.condition = condition;
    if (images) listing.images = images;
    
    await listing.save();
    res.json({ success: true, listing });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Toggle listing featured status
export const toggleListingFeatured = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }
    
    listing.featured = !listing.featured;
    await listing.save();
    
    res.json({ 
      success: true, 
      listing,
      message: listing.featured ? "Listing marked as featured" : "Listing removed from featured"
    });
  } catch (error) {
    console.error("Toggle featured error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};