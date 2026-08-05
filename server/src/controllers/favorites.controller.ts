import type { Response } from 'express';
import { z } from 'zod';
import { Favorite } from '../models/Favorite.js';
import { HttpError } from '../middleware/errorHandler.js';
import type { AuthedRequest } from '../middleware/auth.js';

export async function listFavorites(req: AuthedRequest, res: Response) {
  const favorites = await Favorite.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(
    favorites.map((f) => ({
      characterUrl: f.characterUrl,
      characterName: f.characterName,
      createdAt: f.createdAt,
    }))
  );
}

const addFavoriteSchema = z.object({
  characterUrl: z.string().url(),
  characterName: z.string().min(1),
});

export async function addFavorite(req: AuthedRequest, res: Response) {
  const parsed = addFavoriteSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, 'characterUrl and characterName are required.');

  const favorite = await Favorite.findOneAndUpdate(
    { user: req.userId, characterUrl: parsed.data.characterUrl },
    { $setOnInsert: { characterName: parsed.data.characterName } },
    { upsert: true, new: true }
  );

  res.status(201).json({ characterUrl: favorite.characterUrl, characterName: favorite.characterName });
}

export async function removeFavorite(req: AuthedRequest, res: Response) {
  const rawParam = req.params.characterUrl;
  const characterUrl = decodeURIComponent(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  await Favorite.deleteOne({ user: req.userId, characterUrl });
  res.status(204).end();
}
