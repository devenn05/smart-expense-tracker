import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpRegistration extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phoneNumber?: string;
  emailOtp: string;
  whatsappOtp?: string;
  createdAt: Date;
}

const otpRegistrationSchema: Schema<IOtpRegistration> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  phoneNumber: { type: String }, 
  emailOtp: { type: String, required: true },
  whatsappOtp: { type: String }, 
  // This document automatically deletes itself after 15 minutes (900 seconds)
  createdAt: { type: Date, default: Date.now, expires: 900 },
});

export const OtpRegistration = mongoose.model<IOtpRegistration>(
  'OtpRegistration',
  otpRegistrationSchema
);
