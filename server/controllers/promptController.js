import mongoose from "mongoose";
import Prompt from "../models/Prompt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendPromptToOllama } from "../utils/ollamaClient.js";

export const createPrompt = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  // Fetch last 10 prompts for context to maintain continuity
  const history = await Prompt.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);

  const messages = [];
  // Reverse to get chronological order (oldest first)
  history.reverse().forEach((item) => {
    messages.push({ role: "user", content: item.prompt });
    messages.push({ role: "assistant", content: item.response });
  });
  messages.push({ role: "user", content: prompt.trim() });

  const aiResponse = await sendPromptToOllama(messages);

  const savedPrompt = await Prompt.create({
    userId: req.user._id,
    prompt: prompt.trim(),
    response: aiResponse,
  });

  return res.status(201).json(savedPrompt);
});

export const getPrompts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Prompt.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Prompt.countDocuments({ userId: req.user._id }),
  ]);

  return res.status(200).json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getPromptById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid prompt id" });
  }

  const prompt = await Prompt.findOne({ _id: req.params.id, userId: req.user._id });

  if (!prompt) {
    return res.status(404).json({ message: "Prompt not found" });
  }

  return res.status(200).json(prompt);
});

export const deletePrompt = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid prompt id" });
  }

  const prompt = await Prompt.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!prompt) {
    return res.status(404).json({ message: "Prompt not found" });
  }

  return res.status(200).json({ message: "Prompt deleted" });
});
