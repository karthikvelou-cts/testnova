import { Router } from "express";
import { login, register, getProfile, deleteAccount } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.delete("/delete-account", protect, deleteAccount);

export default router;
