import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import stripe from "stripe";

dotenv.config();

// Models
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    plan: { type: String, default: "free", enum: ["free", "super", "premium"] },
    expiresAt: { type: Date, default: null },
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

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: { type: String, default: "pending", enum: ["pending", "completed", "failed", "refunded"] },
    stripeId: String,
    sessionId: String,
    paymentMethod: String,
    subscriptionDuration: { type: String, default: "yearly" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User = mongoose.model("User", userSchema);
const Prompt = mongoose.model("Prompt", promptSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

// Pricing
const PRICING = {
  super: 500,
  premium: 1000,
};

// DB Connection
let dbConnection = null;

async function connectDB() {
  if (dbConnection) return dbConnection;
  
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set");
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    dbConnection = conn;
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("MONGO_URI:", process.env.MONGO_URI ? "set" : "NOT SET");
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
    if (error.status) {
      throw error;
    }
    console.error("Auth middleware error:", error.message);
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
    // Parse request body - handle Vercel's default body parsing
    let body = {};
    
    // In Vercel Node.js runtime, body is already parsed if content-type is application/json
    if (typeof req.body === "object") {
      body = req.body || {};
    } else if (typeof req.body === "string") {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        body = {};
      }
    }

    // Log for debugging
    console.log(`${req.method} ${req.url}`, { bodyKeys: Object.keys(body) });

    // Parse URL and query parameters
    const url = new URL(req.url || "/", "http://localhost");
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // Health check - doesn't need DB
    if (pathname === "/api/health" && req.method === "GET") {
      return res.status(200).json({ 
        status: "ok",
        env: {
          hasMongoUri: !!process.env.MONGO_URI,
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
          mongoUri: process.env.MONGO_URI ? "configured" : "MISSING",
          jwtSecret: process.env.JWT_SECRET ? "configured" : "MISSING",
          stripeKey: process.env.STRIPE_SECRET_KEY ? "configured" : "MISSING",
        }
      });
    }

    // Connect to DB for other endpoints
    await connectDB();

    // Register endpoint
    if (pathname === "/api/auth/register" && req.method === "POST") {
      const { name, email, password } = body;

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
      const { email, password } = body;

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
          const { prompt } = body;

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

    // Auth endpoints - profile and delete account
    if (pathname.startsWith("/api/auth")) {
      try {
        const user = await authMiddleware(req);

        // GET /api/auth/profile - get current user profile
        if (pathname === "/api/auth/profile" && req.method === "GET") {
          return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            expiresAt: user.expiresAt,
            createdAt: user.createdAt,
          });
        }

        // DELETE /api/auth/delete-account - delete user account
        if (pathname === "/api/auth/delete-account" && req.method === "DELETE") {
          // Delete all user's prompts
          await Prompt.deleteMany({ userId: user._id });
          // Delete all user's transactions
          await Transaction.deleteMany({ userId: user._id });
          // Delete user
          await User.findByIdAndDelete(user._id);

          return res.status(200).json({ message: "Account deleted successfully" });
        }
      } catch (authError) {
        if (authError.status) {
          return res.status(authError.status).json({ message: authError.message });
        }
        throw authError;
      }
    }

    // Payment endpoints
    if (pathname.startsWith("/api/payment")) {
      try {
        const user = await authMiddleware(req);
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

        // POST /api/payment/create-checkout-session
        if (pathname === "/api/payment/create-checkout-session" && req.method === "POST") {
          const { plan, duration } = body;

          if (!plan || !duration) {
            return res.status(400).json({ message: "Plan and duration required" });
          }

          if (!PRICING[plan]) {
            return res.status(400).json({ message: "Invalid plan" });
          }

          // Create Stripe session
          const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: user.email,
            client_reference_id: user._id.toString(),
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: `TestNova ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan (${duration})`,
                    description: `Annual subscription to TestNova ${plan} plan`,
                  },
                  unit_amount: PRICING[plan],
                },
                quantity: 1,
              },
            ],
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/upgrade`,
          });

          // Create pending transaction
          await Transaction.create({
            userId: user._id,
            plan,
            amount: PRICING[plan],
            currency: "usd",
            status: "pending",
            sessionId: session.id,
            subscriptionDuration: duration,
          });

          return res.status(200).json({ sessionId: session.id });
        }

        // POST /api/payment/success
        if (pathname === "/api/payment/success" && req.method === "POST") {
          const { sessionId } = body;

          if (!sessionId) {
            return res.status(400).json({ message: "Session ID required" });
          }

          // Get session from Stripe
          const session = await stripeClient.checkout.sessions.retrieve(sessionId);

          if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
          }

          // Update transaction
          const transaction = await Transaction.findOne({ sessionId });
          if (transaction) {
            transaction.status = "completed";
            transaction.stripeId = session.payment_intent;
            await transaction.save();
          }

          // Update user plan
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);

          await User.findByIdAndUpdate(user._id, {
            plan: transaction?.plan || "super",
            expiresAt,
          });

          return res.status(200).json({ message: "Payment confirmed" });
        }

        // GET /api/payment/transactions
        if (pathname === "/api/payment/transactions" && req.method === "GET") {
          const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
          return res.status(200).json(transactions);
        }
      } catch (authError) {
        console.error("Payment endpoint error:", authError);
        if (authError.status) {
          return res.status(authError.status).json({ message: authError.message });
        }
        // If it's not a custom error with status, log it and return 500
        console.error("Unexpected payment error:", authError.message, authError.stack);
        return res.status(500).json({ message: "Internal server error", error: authError.message });
      }
    }

    // Webhook for Stripe (no auth needed)
    if (pathname === "/api/payment/webhook" && req.method === "POST") {
      const signature = req.headers["stripe-signature"];
      const rawBody = req.rawBody || JSON.stringify(req.body);

      try {
        const event = stripeClient.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );

        // Handle checkout.session.completed
        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          const transaction = await Transaction.findOne({ sessionId: session.id });

          if (transaction) {
            transaction.status = "completed";
            transaction.stripeId = session.payment_intent;
            await transaction.save();

            // Update user
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);

            await User.findByIdAndUpdate(
              new mongoose.Types.ObjectId(session.client_reference_id),
              {
                plan: transaction.plan,
                expiresAt,
              }
            );
          }
        }

        // Handle charge.refunded
        if (event.type === "charge.refunded") {
          const charge = event.data.object;
          const transaction = await Transaction.findOne({ stripeId: charge.payment_intent });

          if (transaction) {
            transaction.status = "refunded";
            await transaction.save();
          }
        }

        return res.status(200).json({ received: true });
      } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(400).json({ error: "Webhook signature verification failed" });
      }
    }

    // 404
    return res.status(404).json({ message: "Not found" });
  } catch (error) {
    console.error("Handler error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      path: req.url,
      method: req.method,
    });
  }
};

