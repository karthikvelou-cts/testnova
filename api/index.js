import app, { initApp } from "../server/app.js";

const handler = async (req, res) => {
  try {
    const expressApp = await initApp();
    expressApp(req, res);
  } catch (error) {
    console.error("API bootstrap failed:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      res.status(500).json({ 
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
};

export default handler;
