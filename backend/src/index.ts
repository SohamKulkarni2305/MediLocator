import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import drugsRoutes from './routes/drugs';
import prescriptionsRoutes from './routes/prescriptions';
import pharmaciesRoutes from './routes/pharmacies';
import casesRoutes from './routes/cases';
import ordersRoutes from './routes/orders';
import complianceRoutes from './routes/compliance';
import aiRoutes from './routes/ai';
import eventsRoutes from './routes/events';
import operationsRoutes from './routes/operations';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3001;

const configuredAppUrl = process.env.APP_URL?.trim();
const allowedOrigins = [
  'http://localhost:3000',
  configuredAppUrl && (configuredAppUrl.startsWith('http://') || configuredAppUrl.startsWith('https://') ? configuredAppUrl : `https://${configuredAppUrl}`),
].filter((origin): origin is string => Boolean(origin));

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', globalLimiter);

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
});
app.use('/api/auth', strictLimiter);
app.use('/api/ai', strictLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', async (req, res) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    res.json({
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[Health Check] Database unavailable', error);
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/drugs', drugsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/pharmacies', pharmaciesRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/operations', operationsRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
