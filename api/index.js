import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

// Models
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User = mongoose.model("User", userSchema);

// DB Connection
let dbConnection = null;

async function connectDB() {
  if (dbConnection) return dbConnection;
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    dbConnection = conn;
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Handler
export default async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Health check - doesn't need DB
    if (req.url === "/api/health" && req.method === "GET") {
      return res.status(200).json({ status: "ok" });
    }

    // Connect to DB for other endpoints
    await connectDB();

    // Register endpoint
    if (req.url === "/api/auth/register" && req.method === "POST") {
      const { name, email, password } = req.body || {};

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
    }

    // Login endpoint
    if (req.url === "/api/auth/login" && req.method === "POST") {
      const { email, password } = req.body || {};

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
          createdAt: user.createdAt,
        },
        token: generateToken(user._id),
      });
    }

    // 404
    return res.status(404).json({ message: "Not found" });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

