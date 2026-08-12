const express = require('express');
const router = express.Router();
const { resetDemoData } = require('../controllers/demoController');

router.post('/reset', resetDemoData);

module.exports = router;
