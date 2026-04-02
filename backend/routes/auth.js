import express from "express";
import { login, register, getProfile, updateProfile, getUserById, getUsersByBadge, updateUserBadge } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/user/:id", getUserById);
router.get("/badge/:badge", getUsersByBadge);

// Admin only routes
router.put("/badge", protect, updateUserBadge);

export default router;