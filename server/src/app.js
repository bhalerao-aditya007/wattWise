const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { isUsingMongo } = require('./config/db');

const authRoutes = require('./routes/auth');
const tariffRoutes = require('./routes/tariffs');
const householdRoutes = require('./routes/households');
const billRoutes = require('./routes/bill');
const simulationRoutes = require('./routes/simulation');
const whatifRoutes = require('./routes/whatif');
const readingsRoutes = require('./routes/readings');
const copilotRoutes = require('./routes/copilot');
const adminRoutes = require('./routes/admin');
const deviceRoutes = require('./routes/devices');
const alertRoutes = require('./routes/alerts');
const splitRoutes = require('./routes/split');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API v1 Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tariffs', tariffRoutes);
app.use('/api/v1/households', householdRoutes);
app.use('/api/v1/bills', billRoutes);
app.use('/api/v1/simulation', simulationRoutes);
app.use('/api/v1/whatif', whatifRoutes);
app.use('/api/v1/readings', readingsRoutes);
app.use('/api/v1/copilot', copilotRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/split', splitRoutes);

// Health check & root endpoints
app.get('/', (req, res) => {
  res.json({ status: 'ok', project: 'WattWise Backend API', version: '1.0.0', endpoints: '/api/v1/tariffs/msedcl' });
});

app.get('/health', (req, res) => {
  const mongoConnected = isUsingMongo() && mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    project: 'WattWise',
    version: '1.0.0',
    database: {
      status: mongoConnected ? 'connected' : 'in-memory',
      type: mongoConnected ? 'MongoDB Atlas' : 'In-Memory Store',
      cluster: mongoConnected ? (mongoose.connection.host || 'cluster0.2dbjxwm.mongodb.net') : 'local',
      readyState: mongoose.connection.readyState
    }
  });
});

app.get('/api/health', (req, res) => {
  const mongoConnected = isUsingMongo() && mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    project: 'WattWise',
    version: '1.0.0',
    database: {
      status: mongoConnected ? 'connected' : 'in-memory',
      type: mongoConnected ? 'MongoDB Atlas' : 'In-Memory Store',
      cluster: mongoConnected ? (mongoose.connection.host || 'cluster0.2dbjxwm.mongodb.net') : 'local',
      readyState: mongoose.connection.readyState
    }
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
  });
});

module.exports = app;
