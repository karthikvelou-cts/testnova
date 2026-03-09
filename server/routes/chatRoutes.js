import { Router } from "express";
import {
  chatWithMemory,
  getConversationById,
  getConversations,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/", chatWithMemory);
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId", getConversationById);

export default router;
