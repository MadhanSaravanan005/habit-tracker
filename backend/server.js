const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

console.log("Starting Habit Tracker Server...");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'public')));

console.log("Middleware configured");

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

console.log("MongoDB setup complete");

// Add a simple test route
app.get("/api/test", (req, res) => {
  console.log("API test endpoint called");
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
  console.log("Health check endpoint called");
  res.status(200).json({ status: "healthy", uptime: process.uptime() });
});

console.log("Loading habit routes...");
try {
  app.use("/api/habits", require("./routes/habitRoutes"));
  console.log("Habit routes loaded successfully");
} catch (err) {
  console.error("Error loading habit routes:", err);
}

// For now, serve a simple React development page
app.get('/', (req, res) => {
  console.log("Root endpoint called");
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch all other routes and serve React app
app.get('*', (req, res) => {
  console.log("Catch-all route called for:", req.path);
  // Don't serve React app for API routes
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ 
      error: 'API route not found',
      path: req.path,
      availableRoutes: ['/api/test', '/api/habits', '/health']
    });
  } else {
    // Serve React app for all other routes
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

console.log("Routes configured");

const PORT = process.env.PORT || 5000;

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received (Ctrl+C). Shutting down gracefully...');
  process.exit(0);
});

console.log(`Starting server on port ${PORT}...`);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Habit Tracker Backend running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
  console.log("✅ Server startup complete!");
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying another port...`);
    process.exit(1);
  }
});

console.log("🎯 Habit Tracker initialization complete");

// If this file is run directly (node backend/server.js), start a server for local development.
if (require.main === module) {
  const port = process.env.PORT || 5000;
  
  // Add error handling for unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process for unhandled rejections
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process for uncaught exceptions in development
  });

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