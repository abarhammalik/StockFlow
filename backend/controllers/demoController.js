const { exec } = require('child_process');
const path = require('path');

/**
 * @desc    Reset demo database with seed data
 * @route   POST /api/demo/reset
 */
const resetDemoData = async (req, res, next) => {
  try {
    const seedScriptPath = path.join(__dirname, '../seed/seed.js');
    
    exec(`node "${seedScriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('[Demo Reset Error]', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to reset demo data',
          error: error.message
        });
      }

      console.log('[Demo Reset Output]', stdout);
      res.json({
        success: true,
        message: 'Demo dataset reset successfully with realistic products, categories, suppliers, and stock movements.',
        output: stdout
      });
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { resetDemoData };
