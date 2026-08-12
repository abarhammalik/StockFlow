const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockflow';

    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from local server');
    });

    const conn = await mongoose.connect(connStr);

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    // Do not terminate process immediately in development so health endpoint can report database status
    return null;
  }
};

const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return {
    state: states[state] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    isConnected: state === 1
  };
};

module.exports = { connectDB, getDBStatus };
