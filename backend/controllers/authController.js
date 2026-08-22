const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase, supabaseAuth } = require('../config/supabase');
const { formatRecord } = require('../utils/supabaseHelpers');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || process.env.AUTH_SECRET || 'stockflow_secure_jwt_secret_key_2026';
};

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '7d',
  });
};

const getEmailRedirectUrl = () => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${clientUrl}/login?verified=true`;
};

/**
 * @desc    Register user via Supabase Auth (sends verification email)
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

    // 1. Check if user already exists in PostgreSQL users table
    const { data: existingUser, error: checkErr } = await supabase
      .from('users')
      .select('id, is_email_verified')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkErr && checkErr.code !== 'PGRST116') throw checkErr;

    if (existingUser) {
      if (existingUser.is_email_verified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
      } else {
        // User exists but never verified — resend verification
        try {
          await supabaseAuth.auth.resend({
            type: 'signup',
            email: cleanEmail,
            options: { emailRedirectTo: getEmailRedirectUrl() },
          });
        } catch (e) {
          // Ignore resend errors
        }
        return res.status(200).json({
          success: true,
          requiresEmailVerification: true,
          email: cleanEmail,
          message: `A verification email has been sent to ${cleanEmail}. Please check your inbox and spam folder.`,
        });
      }
    }

    // 2. Register user via Supabase Auth (sends verification email automatically)
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: getEmailRedirectUrl(),
      },
    });

    if (authError) {
      // Handle Supabase-specific errors
      if (authError.message?.includes('already registered')) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
      }
      throw authError;
    }

    // 3. Hash password and insert into users table (unverified)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userPayload = {
      name: name.trim(),
      email: cleanEmail,
      password: passwordHash,
      auth_methods: ['email'],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      is_email_verified: false,
    };

    // Use Supabase Auth user ID if available
    if (authData?.user?.id) {
      userPayload.id = authData.user.id;
    }

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

    // 4. Return verification-pending response (NO token issued)
    res.status(201).json({
      success: true,
      requiresEmailVerification: true,
      email: cleanEmail,
      message: `A verification email has been sent to ${cleanEmail}. Please check your inbox and spam folder, then click the verification link to activate your account.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user with Email + Password (requires verified email)
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

    // 1. Authenticate via Supabase Auth
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError) {
      // Check if the error is due to unconfirmed email
      if (
        authError.message?.toLowerCase().includes('email not confirmed') ||
        authError.message?.toLowerCase().includes('email_not_confirmed')
      ) {
        return res.status(403).json({
          success: false,
          requiresEmailVerification: true,
          email: cleanEmail,
          message: 'Your email address has not been verified yet. Please check your inbox for the verification link, or request a new one.',
        });
      }

      // Generic invalid credentials
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // 2. Supabase Auth succeeded — look up user in PostgreSQL
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

    // 3. Verify password against our stored hash (belt-and-suspenders)
    const storedHash = user.password_hash || user.password;
    if (storedHash) {
      const isMatch = await bcrypt.compare(password, storedHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
      }
    }

    // 4. Mark email as verified in our DB (Supabase confirmed it)
    if (!user.is_email_verified) {
      await supabase
        .from('users')
        .update({ is_email_verified: true })
        .eq('id', user.id);
      user.is_email_verified = true;
    }

    // 5. Generate JWT token & return user
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
 * @desc    Resend Email Verification Link
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const { error } = await supabaseAuth.auth.resend({
      type: 'signup',
      email: cleanEmail,
      options: { emailRedirectTo: getEmailRedirectUrl() },
    });

    if (error) {
      console.warn('[Auth] Resend verification error:', error.message);
      // Still return success to prevent email enumeration
    }

    res.json({
      success: true,
      message: `If an account exists for ${cleanEmail}, a new verification email has been sent. Please check your inbox and spam folder.`,
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
        authMethods: formatted.authMethods || ['email'],
        isEmailVerified: Boolean(formatted.isEmailVerified ?? formatted.is_email_verified),
        isPhoneVerified: Boolean(formatted.isPhoneVerified ?? formatted.is_phone_verified),
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
  resendVerification,
};
