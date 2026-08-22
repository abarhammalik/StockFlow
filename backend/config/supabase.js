const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in .env.');
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

let isConnected = false;

const testConnection = async () => {
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    console.warn('[Supabase] Client initialized in mock/unconfigured mode. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    isConnected = false;
    return false;
  }

  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn(`[Supabase] Connection test response: ${error.message}`);
      // Even if users table is empty or has a permission note, if it reachable:
      if (error.code === '42P01') {
        console.warn('[Supabase] Tables not found yet. Please run backend/db/schema.sql in the Supabase SQL Editor.');
      }
      isConnected = false;
      return false;
    }
    console.log(`[Supabase] Successfully connected to PostgreSQL instance at: ${supabaseUrl}`);
    isConnected = true;
    return true;
  } catch (err) {
    console.error(`[Supabase] Connection error: ${err.message}`);
    isConnected = false;
    return false;
  }
};

const getDBStatus = () => {
  return {
    state: isConnected ? 'connected' : 'connecting',
    provider: 'Supabase (PostgreSQL)',
    url: supabaseUrl ? supabaseUrl.replace(/^https?:\/\//, '') : null,
    isConnected: isConnected,
  };
};

module.exports = {
  supabase,
  testConnection,
  getDBStatus,
};
