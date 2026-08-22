const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { formatRecord } = require('../utils/supabaseHelpers');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please sign in.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'stockflow_secure_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, avatar, auth_methods, is_email_verified, is_phone_verified, created_at, updated_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists or session is invalid.',
      });
    }

    req.user = formatRecord(user);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
    });
  }
};

module.exports = { protect };
