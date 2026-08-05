import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../services/token.service.js';

export interface AuthedRequest extends Request {
  userId?: string;
  username?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.username = payload.username;
    next();
  } catch {
    return res.status(401).json({ error: 'Access token is invalid or expired.' });
  }
}
