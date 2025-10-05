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

// MongoDB connection with Railway-friendly error handling
const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;
if (!mongoUri) {
  console.warn("Warning: No MongoDB URI found. Some features may not work.");
} else {
  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => {
      console.error("MongoDB connection error:", err);
      console.log("App will continue without database connection for health checks");
    });
}

// Add a simple test route
app.get("/api/test", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    message: "Habit Tracker Backend is working!", 
    timestamp: new Date(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", uptime: process.uptime() });
});

app.use("/api/habits", require("./routes/habitRoutes"));

// Serve the main app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// If this file is run directly (node backend/server.js), start a server for local development.
if (require.main === module) {
  const port = process.env.PORT || 5000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Habit Tracker Server running on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/api/test`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
} 

// Export the Express app
module.exports = app;