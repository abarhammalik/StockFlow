const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route Handlers
const healthRoutes = require('./routes/healthRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const stockRoutes = require('./routes/stockRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const customerRoutes = require('./routes/customerRoutes');
const saleRoutes = require('./routes/saleRoutes');
const poRoutes = require('./routes/poRoutes');
const auditRoutes = require('./routes/auditRoutes');
const demoRoutes = require('./routes/demoRoutes');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO Server for Live Stock Updates
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Middleware to attach Socket.IO instance to HTTP requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Mount REST API Routes
app.use('/api', healthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock-movements', stockRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/demo', demoRoutes);

// Serve Static Frontend Assets (Production single-server deployment)
const path = require('path');
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Root Welcome Endpoint (Fallback when frontend is not built)
  app.get('/', (req, res) => {
    res.json({
      name: 'StockFlow Master API',
      status: 'online',
      webSockets: 'enabled',
      endpoints: {
        health: '/api/health',
        products: '/api/products',
        categories: '/api/categories',
        suppliers: '/api/suppliers',
        stockMovements: '/api/stock-movements',
        customers: '/api/customers',
        sales: '/api/sales',
        analytics: '/api/analytics/dashboard'
      }
    });
  });
}

// Central 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

// Connect Local MongoDB & Launch Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  StockFlow API & WebSocket Server on port ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  Target DB: mongodb://127.0.0.1:27017/stockflow`);
    console.log(`=================================================`);
  });
});
