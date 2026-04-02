// controllers/sponsorController.js
import Sponsor from "../models/Sponsor.js";

// @desc    Create a new sponsor
// @route   POST /api/sponsors
// @access  Private/Admin
export const createSponsor = async (req, res) => {
  try {
    const { name, logo, description, website, category, contactEmail, contactPhone, featured } = req.body;

    // Check if sponsor already exists
    const sponsorExists = await Sponsor.findOne({ name });
    if (sponsorExists) {
      return res.status(400).json({ msg: "Sponsor already exists with this name" });
    }

    const sponsor = await Sponsor.create({
      name,
      logo,
      description,
      website,
      category,
      contactEmail,
      contactPhone,
      featured: featured || false
    });

    res.status(201).json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    console.error("Create sponsor error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// @desc    Get all sponsors
// @route   GET /api/sponsors
// @access  Public
export const getSponsors = async (req, res) => {
  try {
    const { isActive, category, featured } = req.query;
    
    let query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    const sponsors = await Sponsor.find(query)
      .sort({ displayOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      count: sponsors.length,
      data: sponsors
    });
  } catch (error) {
    console.error("Get sponsors error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// @desc    Get single sponsor by ID
// @route   GET /api/sponsors/:id
// @access  Public
export const getSponsorById = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    
    if (!sponsor) {
      return res.status(404).json({ msg: "Sponsor not found" });
    }
    
    res.json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    console.error("Get sponsor error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// @desc    Update sponsor
// @route   PUT /api/sponsors/:id
// @access  Private/Admin
export const updateSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    
    if (!sponsor) {
      return res.status(404).json({ msg: "Sponsor not found" });
    }
    
    // Update fields
    const { name, logo, description, website, category, isActive, displayOrder, contactEmail, contactPhone, featured } = req.body;
    
    if (name) sponsor.name = name;
    if (logo) sponsor.logo = logo;
    if (description) sponsor.description = description;
    if (website) sponsor.website = website;
    if (category) sponsor.category = category;
    if (isActive !== undefined) sponsor.isActive = isActive;
    if (displayOrder !== undefined) sponsor.displayOrder = displayOrder;
    if (contactEmail) sponsor.contactEmail = contactEmail;
    if (contactPhone) sponsor.contactPhone = contactPhone;
    if (featured !== undefined) sponsor.featured = featured;
    
    const updatedSponsor = await sponsor.save();
    
    res.json({
      success: true,
      data: updatedSponsor
    });
  } catch (error) {
    console.error("Update sponsor error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// @desc    Delete sponsor
// @route   DELETE /api/sponsors/:id
// @access  Private/Admin
export const deleteSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    
    if (!sponsor) {
      return res.status(404).json({ msg: "Sponsor not found" });
    }
    
    await sponsor.deleteOne();
    
    res.json({
      success: true,
      msg: "Sponsor deleted successfully"
    });
  } catch (error) {
    console.error("Delete sponsor error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// @desc    Bulk update sponsor display order
// @route   PUT /api/sponsors/bulk/order
// @access  Private/Admin
export const bulkUpdateOrder = async (req, res) => {
  try {
    const { sponsors } = req.body; // Array of { id, displayOrder }
    
    if (!sponsors || !Array.isArray(sponsors)) {
      return res.status(400).json({ msg: "Invalid data format" });
    }
    
    const updates = sponsors.map(sponsor => 
      Sponsor.findByIdAndUpdate(sponsor.id, { displayOrder: sponsor.displayOrder })
    );
    
    await Promise.all(updates);
    
    res.json({
      success: true,
      msg: "Sponsor order updated successfully"
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// @desc    Toggle sponsor active status
// @route   PATCH /api/sponsors/:id/toggle
// @access  Private/Admin
export const toggleSponsorStatus = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    
    if (!sponsor) {
      return res.status(404).json({ msg: "Sponsor not found" });
    }
    
    sponsor.isActive = !sponsor.isActive;
    await sponsor.save();
    
    res.json({
      success: true,
      data: sponsor,
      msg: `Sponsor ${sponsor.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error("Toggle sponsor error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};