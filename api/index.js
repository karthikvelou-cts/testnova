import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDB } from "../server/config/db.js";
import { errorHandler, notFound } from "../server/middleware/errorMiddleware.js";
import authRoutes from "../server/routes/authRoutes.js";
import promptRoutes from "../server/routes/promptRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/prompts", promptRoutes);

app.use(notFound);
app.use(errorHandler);

let dbConnected = false;
let dbPromise = null;

const handler = (req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure DB is connected only once
      if (!dbConnected && !dbPromise) {
        dbPromise = connectDB();
      }
      
      if (dbPromise && !dbConnected) {
        await dbPromise;
        dbConnected = true;
      }

      // Handle the request with Express
      app(req, res, (err) => {
        if (err) {
          console.error("Express middleware error:", err);
          if (!res.headersSent) {
            res.status(500).json({ message: "Internal server error" });
          }
        }
        resolve();
      });
    } catch (error) {
      console.error("API handler error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
      reject(error);
    }
  });
};

export default handler;
