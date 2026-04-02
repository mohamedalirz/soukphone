// routes/upload.js
import express from "express";
import upload from "../middleware/upload.js";
import { uploadImage, deleteImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", upload.single("image"), uploadImage);
router.delete("/", protect, deleteImage); // Optional: delete single image

export default router;