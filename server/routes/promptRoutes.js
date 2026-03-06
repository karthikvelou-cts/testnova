import { Router } from "express";
import {
  createPrompt,
  deletePrompt,
  getPromptById,
  getPrompts,
} from "../controllers/promptController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.route("/").post(createPrompt).get(getPrompts);
router.route("/:id").get(getPromptById).delete(deletePrompt);

export default router;
