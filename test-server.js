const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

console.log("1. Starting server...");

dotenv.config();
console.log("2. Environment loaded");

const app = express();
console.log("3. Express app created");

app.use(express.json());
app.use(cors());
console.log("4. Middleware configured");

// Simple test route
app.get("/api/test", (req, res) => {
  console.log("API test route called");
  res.json({ message: "Server is working!", timestamp: new Date() });
});

console.log("5. Routes configured");

// Start server
const port = process.env.PORT || 5000;
console.log("6. About to start listening on port", port);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`7. Server successfully started on port ${port}`);
});

server.on('error', (err) => {
  console.error("Server error:", err);
});

console.log("8. Server setup complete");

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

console.log("9. Process handlers set up");