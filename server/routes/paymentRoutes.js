import express from "express";
import {
  createCheckoutSession,
  handlePaymentSuccess,
  getTransactionHistory,
  handleWebhook,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for webhook
router.post("/webhook", handleWebhook);

// Protected routes
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/success", protect, handlePaymentSuccess);
router.get("/transactions", protect, getTransactionHistory);

export default router;
