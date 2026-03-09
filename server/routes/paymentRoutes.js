import express from "express";
import {
  createCheckoutSession,
  handlePaymentSuccess,
  getTransactionHistory,
  handleWebhook,
} from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for webhook
router.post("/webhook", handleWebhook);

// Protected routes
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.post("/success", authMiddleware, handlePaymentSuccess);
router.get("/transactions", authMiddleware, getTransactionHistory);

export default router;
