import dotenv from "dotenv";
import app, { initApp } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

initApp()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server bootstrap failed:", error.message);
    process.exit(1);
  });
