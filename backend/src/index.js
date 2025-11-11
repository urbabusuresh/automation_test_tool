const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const testRoutes = require('./routes/testRoutes');
const executionRoutes = require('./routes/executionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Ensure necessary directories exist
const ensureDirectories = async () => {
  const dirs = [
    path.join(__dirname, '../data/tests'),
    path.join(__dirname, '../data/results'),
    path.join(__dirname, '../data/screenshots')
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
};

ensureDirectories();

// Routes
app.use('/api/tests', testRoutes);
app.use('/api/executions', executionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AutoTestFlow API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AutoTestFlow Backend running on http://localhost:${PORT}`);
});

module.exports = app;
