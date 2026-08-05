import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { favoritesRouter } from './routes/favorites.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRouter);
  app.use('/api/favorites', favoritesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
