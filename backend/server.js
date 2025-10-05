const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Add a simple test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Habit Tracker Backend is working!", timestamp: new Date() });
});

app.use("/api/habits", require("./routes/habitRoutes"));

// Serve the main app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// If this file is run directly (node backend/server.js), start a server for local development.
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Habit Tracker Server running on port ${port}`));
} 

// Export the Express app
module.exports = app;