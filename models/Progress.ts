import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  weight?: number;
  bodyMeasurements?: {
    waist?: number;
    chest?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  bodyFat?: number;
  muscleMass?: number;
  photos?: string[];
  notes?: string;
  mood?: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  workoutCompleted?: boolean;
  waterIntake?: number; // in ml
  sleepHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  weight: {
    type: Number,
    min: 1,
    max: 1000
  },
  bodyMeasurements: {
    waist: { type: Number, min: 1 },
    chest: { type: Number, min: 1 },
    hips: { type: Number, min: 1 },
    arms: { type: Number, min: 1 },
    thighs: { type: Number, min: 1 }
  },
  bodyFat: {
    type: Number,
    min: 0,
    max: 100
  },
  muscleMass: {
    type: Number,
    min: 0
  },
  photos: [{ type: String }],
  notes: {
    type: String,
    maxlength: 1000
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor', 'terrible']
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  workoutCompleted: {
    type: Boolean,
    default: false
  },
  waterIntake: {
    type: Number,
    min: 0,
    default: 0
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  }
}, {
  timestamps: true
});

// Ensure unique entry per user per date
ProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);