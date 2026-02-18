const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config({ path: ".env.local" });

// Use Google DNS to bypass restricted network DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
