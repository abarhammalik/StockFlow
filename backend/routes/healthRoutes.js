const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/supabase');

/**
 * @route   GET /api/health
 * @desc    Health check & Database connectivity status endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();

  const response = {
    status: 'ok',
    service: 'StockFlow Backend API (Supabase / PostgreSQL)',
    timestamp: new Date().toISOString(),
    database: {
      provider: dbStatus.provider || 'Supabase (PostgreSQL)',
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      url: dbStatus.url,
    },
  };

  if (!dbStatus.isConnected) {
    return res.status(200).json({
      ...response,
      status: 'notice',
      message: 'Supabase credentials pending or connecting. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured in .env',
    });
  }

  res.json(response);
});

module.exports = router;
