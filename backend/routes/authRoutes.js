const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  updateProfile,
  resendVerification,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Direct Email Authentication Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

