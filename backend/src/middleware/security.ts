import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Application } from 'express';

export const applySecurityMiddleware = (app: Application) => {
  // Secure HTTP headers
  app.use(helmet());

  // Logging
  app.use(morgan('dev'));

  // Rate limiter (e.g., 100 requests per 15 minutes per IP)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
  });
  app.use(limiter);
};
