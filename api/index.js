import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

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

const promptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User = mongoose.model("User", userSchema);
const Prompt = mongoose.model("Prompt", promptSchema);

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

// Auth Middleware
async function authMiddleware(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw { status: 401, message: "Not authorized, token missing" };
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw { status: 401, message: "User not found" };
    }
    return user;
  } catch (error) {
    throw { status: 401, message: "Not authorized, token invalid" };
  }
}

// Ollama Client
async function sendPromptToOllama(prompt) {
  const headers = { "Content-Type": "application/json" };

  if (process.env.OLLAMA_API_KEY) {
    headers.Authorization = `Bearer ${process.env.OLLAMA_API_KEY}`;
  }

  const payload = {
    model: process.env.OLLAMA_MODEL || "devstral-small-2:24b",
    messages: [{ role: "user", content: prompt }],
    stream: false,
    options: {
      temperature: 0.2,
      num_predict: 300
    }
  };

  const { data } = await axios.post(
    process.env.OLLAMA_API_URL || "https://ollama.com/api/chat",
    payload,
    { headers, timeout: 120000 }
  );

  return data?.message?.content || data?.response || "No response from model.";
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
    // Parse URL and query parameters
    const url = new URL(req.url || "/", "http://localhost");
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // Health check - doesn't need DB
    if (pathname === "/api/health" && req.method === "GET") {
      return res.status(200).json({ status: "ok" });
    }

    // Connect to DB for other endpoints
    await connectDB();

    // Register endpoint
    if (pathname === "/api/auth/register" && req.method === "POST") {
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
    if (pathname === "/api/auth/login" && req.method === "POST") {
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

    // Prompts endpoints - require auth
    if (pathname.startsWith("/api/prompts")) {
      try {
        const user = await authMiddleware(req);

        // GET /api/prompts - list prompts
        if (pathname === "/api/prompts" && req.method === "GET") {
          const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
          const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 50);
          const skip = (page - 1) * limit;

          const [items, total] = await Promise.all([
            Prompt.find({ userId: user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Prompt.countDocuments({ userId: user._id }),
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
        }

        // POST /api/prompts - create prompt
        if (pathname === "/api/prompts" && req.method === "POST") {
          const { prompt } = req.body || {};

          if (!prompt || !prompt.trim?.()) {
            return res.status(400).json({ message: "Prompt is required" });
          }

          const aiResponse = await sendPromptToOllama(prompt.trim());

          const savedPrompt = await Prompt.create({
            userId: user._id,
            prompt: prompt.trim(),
            response: aiResponse,
          });

          return res.status(201).json(savedPrompt);
        }

        // GET /api/prompts/:id - get prompt by id
        const promptIdMatch = pathname.match(/^\/api\/prompts\/([a-f0-9]{24})$/);
        if (promptIdMatch && req.method === "GET") {
          const promptId = promptIdMatch[1];
          const prompt = await Prompt.findOne({ _id: promptId, userId: user._id });

          if (!prompt) {
            return res.status(404).json({ message: "Prompt not found" });
          }

          return res.status(200).json(prompt);
        }

        // DELETE /api/prompts/:id - delete prompt
        if (promptIdMatch && req.method === "DELETE") {
          const promptId = promptIdMatch[1];
          const prompt = await Prompt.findOneAndDelete({ _id: promptId, userId: user._id });

          if (!prompt) {
            return res.status(404).json({ message: "Prompt not found" });
          }

          return res.status(200).json({ message: "Prompt deleted" });
        }
      } catch (authError) {
        if (authError.status) {
          return res.status(authError.status).json({ message: authError.message });
        }
        throw authError;
      }
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

