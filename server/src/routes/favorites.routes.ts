import { Router } from 'express';
import { addFavorite, listFavorites, removeFavorite } from '../controllers/favorites.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const favoritesRouter = Router();

favoritesRouter.use(requireAuth);
favoritesRouter.get('/', asyncHandler(listFavorites));
favoritesRouter.post('/', asyncHandler(addFavorite));
favoritesRouter.delete('/:characterUrl', asyncHandler(removeFavorite));
