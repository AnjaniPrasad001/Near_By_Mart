import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config';
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import ApiError from './utils/ApiError';

// ──────────────────────────────────────────────
// Create Express application
// ──────────────────────────────────────────────
const app = express();

// ──────────────────────────────────────────────
// Security middleware
// ──────────────────────────────────────────────

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ──────────────────────────────────────────────
// Body parsing
// ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ──────────────────────────────────────────────
// Logging
// ──────────────────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ──────────────────────────────────────────────
// API routes
// ──────────────────────────────────────────────
app.use('/api', routes);

// ──────────────────────────────────────────────
// 404 handler — catch unmatched routes
// ──────────────────────────────────────────────
app.use((_req, _res, next) => {
  next(ApiError.notFound('Route not found'));
});

// ──────────────────────────────────────────────
// Global error handler (must be last)
// ──────────────────────────────────────────────
app.use(errorHandler);

export default app;
