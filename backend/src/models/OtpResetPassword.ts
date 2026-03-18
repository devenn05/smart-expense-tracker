import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpResetPassword extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpResetSchema: Schema<IOtpResetPassword> = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // Expires exactly 15 minutes after creation
});

export const OtpResetPassword = mongoose.model<IOtpResetPassword>('OtpResetPassword', otpResetSchema);