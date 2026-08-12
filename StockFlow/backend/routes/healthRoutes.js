const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

/**
 * @route   GET /api/health
 * @desc    Health check & Database connectivity status endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  
  const response = {
    status: 'ok',
    service: 'StockFlow Backend API',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      host: dbStatus.host,
      name: dbStatus.name,
      targetUri: 'mongodb://127.0.0.1:27017/stockflow'
    }
  };

  if (!dbStatus.isConnected) {
    return res.status(503).json({
      ...response,
      status: 'degraded',
      message: 'Database is not connected. Ensure MongoDB Community Server is running on localhost:27017'
    });
  }

  res.json(response);
});

module.exports = router;
