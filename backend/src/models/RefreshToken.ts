import mongoose, { Schema, HydratedDocument } from 'mongoose';
import crypto from 'crypto';

export interface IRefreshToken {
  user: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

type RefreshTokenDocument = HydratedDocument<IRefreshToken>;

const refreshTokenSchema = new Schema<IRefreshToken>({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

refreshTokenSchema.pre('save', async function () {
  const doc = this as RefreshTokenDocument;

  if (!doc.isModified('token')) return;

  doc.token = crypto
    .createHash('sha256')
    .update(doc.token)
    .digest('hex');
});

export const RefreshToken = mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
);