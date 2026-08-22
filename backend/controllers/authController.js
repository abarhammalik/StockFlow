const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');
const { formatRecord } = require('../utils/supabaseHelpers');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || process.env.AUTH_SECRET || 'stockflow_secure_jwt_secret_key_2026';
};

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '7d',
  });
};

/**
 * @desc    Direct Email Registration (Instant Signup & Authentication)
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email address, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user already exists in PostgreSQL
    const { data: existingUser, error: checkErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkErr && checkErr.code !== 'PGRST116') throw checkErr;

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    // 2. Register user in Supabase Auth (admin or standard)
    let supabaseUserId = null;
    try {
      if (supabase.auth.admin) {
        const { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: password,
          email_confirm: true,
          user_metadata: { name: name.trim() },
        });
        if (!adminErr && adminData?.user?.id) {
          supabaseUserId = adminData.user.id;
        }
      }
    } catch (e) {
      // Ignore if admin API not permitted, proceed with standard insert
    }

    // 3. Hash password and insert into users table
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userPayload = {
      name: name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
      auth_methods: ['email'],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      is_email_verified: true,
    };
    if (supabaseUserId) userPayload.id = supabaseUserId;

    let { data: newUser, error: insertErr } = await supabase
      .from('users')
      .insert(userPayload)
      .select('*')
      .single();

    if (insertErr) {
      // If error with custom ID, retry with default UUID generation
      delete userPayload.id;
      const { data: retryUser, error: retryErr } = await supabase
        .from('users')
        .insert(userPayload)
        .select('*')
        .single();
      if (retryErr) throw retryErr;
      newUser = retryUser;
    }

    // 4. Generate JWT token
    const token = generateToken(newUser.id);
    const formatted = formatRecord(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to StockFlow.',
      token,
      user: {
        _id: formatted.id,
        id: formatted.id,
        name: formatted.name,
        email: formatted.email,
        phone: formatted.phone || '',
        avatar: formatted.avatar,
        authMethods: ['email'],
        isEmailVerified: true,
        createdAt: formatted.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user with Email + Password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email address and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Look up user by email
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // 2. Compare password hash
    const storedHash = user.password_hash || user.password;
    if (!storedHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // 3. Generate token & return user
    const token = generateToken(user.id);
    const formatted = formatRecord(user);

    res.json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: {
        _id: formatted.id,
        id: formatted.id,
        name: formatted.name,
        email: formatted.email,
        phone: formatted.phone || '',
        avatar: formatted.avatar,
        authMethods: ['email'],
        isEmailVerified: true,
        createdAt: formatted.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update User Profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, avatar } = req.body;
    const userId = req.user.id || req.user._id;

    const updates = {};
    if (name) updates.name = name.trim();
    if (avatar) updates.avatar = avatar;
    if (phone) updates.phone = phone.trim();

    if (email && email.toLowerCase().trim() !== (req.user.email || '').toLowerCase()) {
      const cleanEmail = email.toLowerCase().trim();
      const { data: existing } = await supabase.from('users').select('id').eq('email', cleanEmail).maybeSingle();
      if (existing && existing.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use by another account.',
        });
      }
      updates.email = cleanEmail;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (updateErr) throw updateErr;
    const formatted = formatRecord(updated);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: formatted.id,
        id: formatted.id,
        name: formatted.name,
        email: formatted.email || '',
        phone: formatted.phone || '',
        avatar: formatted.avatar,
        authMethods: ['email'],
        createdAt: formatted.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
};
