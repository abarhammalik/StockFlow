const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAuditLogs);

module.exports = router;
