import app, { initApp } from "../server/app.js";

const handler = async (req, res) => {
  try {
    await initApp();
    return app(req, res);
  } catch (error) {
    console.error("API bootstrap failed:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default handler;
