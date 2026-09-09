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

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', process.env.APP_URL || ''] }));
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
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

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
