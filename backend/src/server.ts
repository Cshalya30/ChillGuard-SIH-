import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { initDatabase } from './db/schema';
import { seedDatabase } from './db/seed';
import { initSocketServer } from './services/socketService';
import { errorHandler } from './middleware/errorHandler';

import shipmentsRouter from './routes/shipments';
import readingsRouter from './routes/readings';
import alertsRouter from './routes/alerts';
import complianceRouter from './routes/compliance';
import analyticsRouter from './routes/analytics';

const app = express();
const server = http.createServer(app);

// 1. Initialize SQLite Database & Seed Data
initDatabase();
seedDatabase();

// 2. Security Middlewares
app.use(helmet());

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Request size limit (10kb max)
app.use(express.json({ limit: '10kb' }));

// General Rate Limiting: 100 req/min per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// Telemetry Ingestion Rate Limiter: 20 req/min on POST /readings
const readingsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'Telemetry ingestion rate limit exceeded.' }
});

app.use('/api/v1/', generalLimiter);

// 3. API Routes
app.use('/api/v1/shipments', shipmentsRouter);
app.use('/api/v1/readings', readingsLimiter, readingsRouter);
app.use('/api/v1/alerts', alertsRouter);
app.use('/api/v1/compliance', complianceRouter);
app.use('/api/v1/analytics', analyticsRouter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

// 4. Global Error Handler
app.use(errorHandler);

// 5. Initialize Socket.io Server
initSocketServer(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[ChillGuard Backend] Running on http://localhost:${PORT}`);
  console.log(`[ChillGuard Backend] Socket.io active. Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, server };
