import { Router } from "express";
import { login, register, getProfile, deleteAccount } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.delete("/delete-account", authMiddleware, deleteAccount);

export default router;
