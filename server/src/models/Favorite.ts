import { Schema, model } from 'mongoose';

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // SWAPI person url doubles as a stable external id, e.g. https://swapi.info/api/people/1
    characterUrl: { type: String, required: true },
    characterName: { type: String, required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, characterUrl: 1 }, { unique: true });

export const Favorite = model('Favorite', favoriteSchema);
