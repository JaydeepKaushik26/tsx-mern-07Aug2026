import { Schema, model, Types } from 'mongoose';

const refreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  replacedByTokenHash: { type: String, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

// Mongo TTL index: documents are automatically removed once expiresAt passes.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export interface RefreshTokenDoc {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenHash: string | null;
}

export const RefreshToken = model('RefreshToken', refreshTokenSchema);
