import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Prompt from "../models/Prompt.js";
import Transaction from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  return res.status(201).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token: generateToken(user._id),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      expiresAt: user.expiresAt,
      createdAt: user.createdAt,
    },
    token: generateToken(user._id),
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      expiresAt: user.expiresAt,
      createdAt: user.createdAt,
    },
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.userId;

  // Delete all user's prompts
  await Prompt.deleteMany({ userId });

  // Delete all user's transactions
  await Transaction.deleteMany({ userId });

  // Delete the user
  await User.findByIdAndDelete(userId);

  return res.json({
    message: "Account deleted successfully",
  });
});
