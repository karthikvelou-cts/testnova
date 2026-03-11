import Conversation from "../models/Conversation.js";
import Prompt from "../models/Prompt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendPromptToOllama } from "../utils/ollamaClient.js";

const MAX_CONTEXT_MESSAGES = 10;

const buildHistoryPreview = (messages) => {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const preview = firstUserMessage?.content || "New conversation";
  return preview.length > 70 ? `${preview.slice(0, 70)}...` : preview;
};

export const chatWithMemory = asyncHandler(async (req, res) => {
  const { conversationId, prompt } = req.body;

  if (!conversationId || typeof conversationId !== "string" || !conversationId.trim()) {
    return res.status(400).json({ message: "conversationId is required" });
  }

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  const normalizedConversationId = conversationId.trim();
  const userMessage = { role: "user", content: prompt.trim() };

  let conversation = await Conversation.findOne({
    userId: req.user._id,
    conversationId: normalizedConversationId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      userId: req.user._id,
      conversationId: normalizedConversationId,
      messages: [userMessage],
    });
  } else {
    conversation.messages.push(userMessage);
  }

  const contextMessages = conversation.messages.slice(-MAX_CONTEXT_MESSAGES);
  const assistantResponse = await sendPromptToOllama(contextMessages);
  conversation.messages.push({ role: "assistant", content: assistantResponse });
  await conversation.save();
  await Prompt.create({
    userId: req.user._id,
    prompt: prompt.trim(),
    response: assistantResponse,
  });

  return res.status(200).json({ response: assistantResponse });
});

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ userId: req.user._id })
    .sort({ updatedAt: -1 })
    .select("conversationId messages createdAt updatedAt");

  const items = conversations.map((conversation) => ({
    conversationId: conversation.conversationId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    preview: buildHistoryPreview(conversation.messages),
    messageCount: conversation.messages.length,
  }));

  return res.status(200).json({ items });
});

export const getConversationById = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId?.trim();

  if (!conversationId) {
    return res.status(400).json({ message: "conversationId is required" });
  }

  const conversation = await Conversation.findOne({
    userId: req.user._id,
    conversationId,
  }).select("conversationId messages createdAt updatedAt");

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  return res.status(200).json({
    conversationId: conversation.conversationId,
    messages: conversation.messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
});
