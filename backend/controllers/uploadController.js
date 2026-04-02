// controllers/uploadController.js
import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    console.log('File received:', req.file.originalname);
    
    // Use a Promise-based approach
    const uploadStream = (buffer) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "phones" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
    };

    const result = await uploadStream(req.file.buffer);
    
    // Return both URL and public_id for future deletion
    res.json({ 
      url: result.secure_url, 
      public_id: result.public_id,
      success: true 
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Optional: Function to delete a single image
export const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    
    if (!public_id) {
      return res.status(400).json({ msg: "No public_id provided" });
    }
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ msg: "Failed to delete image", error: error.message });
  }
};