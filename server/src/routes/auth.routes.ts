import { Router } from 'express';
import { login, logout, me, refresh } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(login));
authRouter.post('/refresh', asyncHandler(refresh));
authRouter.post('/logout', asyncHandler(logout));
authRouter.get('/me', requireAuth, asyncHandler(me));
