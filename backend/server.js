const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { createProxyMiddleware } = require('http-proxy-middleware');

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

// In development/Railway, proxy to React dev server
if (process.env.NODE_ENV !== 'production') {
  // Proxy to React dev server
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true, // Enable websocket proxying for hot reload
    onError: (err, req, res) => {
      console.log('Proxy error:', err.message);
      // Fallback: serve a simple message if React dev server isn't ready
      res.status(503).send(`
        <html>
          <body>
            <h2>React Dev Server Starting...</h2>
            <p>Please wait a moment for the React development server to start.</p>
            <script>setTimeout(() => location.reload(), 3000);</script>
          </body>
        </html>
      `);
    }
  }));
} else {
  // Production: serve static files
  app.use(express.static(path.join(__dirname, '../public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

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