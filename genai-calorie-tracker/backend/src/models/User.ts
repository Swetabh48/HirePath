import mongoose, { Schema, Document, Types } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  goal: 'loss' | 'maintenance' | 'gain';
  dietaryPreferences: string[];
  allergies: string[];
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    heightCm: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    goal: { type: String, enum: ['loss', 'maintenance', 'gain'], required: true },
    dietaryPreferences: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', UserSchema);

