// Main entry point for the Express server
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import dns from 'dns';

// Force Node.js to use IPv4 first to prevent ENETUNREACH errors in Docker/Railway
// environments that do not have outbound IPv6 routing enabled.
dns.setDefaultResultOrder('ipv4first');

import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import carRoutes from './routes/carRoutes';
import reviewRoutes from './routes/reviewRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import adminRoutes from './routes/adminRoutes';
import supportRoutes from './routes/supportRoutes';
import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// connect to MongoDB
connectDB();

// allow requests from frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://car-insight-pro-ten.vercel.app',
  process.env.CLIENT_URL || ''
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

// security and logging
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// limit requests to prevent abuse (increased for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000 // Increased from 100 to 5000
});
app.use('/api', limiter);

// health check — Railway uses this
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// all routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// handle errors globally
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
