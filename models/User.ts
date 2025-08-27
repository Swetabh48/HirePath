import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    weight: number; // in kg
    height: number; // in cm
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
    fitnessGoal: 'weight_loss' | 'maintenance' | 'weight_gain' | 'muscle_gain';
    dietaryPreferences: string[];
    allergies: string[];
    dailyCalorieGoal: number;
    dailyProteinGoal: number;
    dailyCarbGoal: number;
    dailyFatGoal: number;
  };
  preferences: {
    units: 'metric' | 'imperial';
    notifications: {
      meals: boolean;
      water: boolean;
      workouts: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    gender: { 
      type: String, 
      required: true, 
      enum: ['male', 'female', 'other'] 
    },
    weight: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
    activityLevel: {
      type: String,
      required: true,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']
    },
    fitnessGoal: {
      type: String,
      required: true,
      enum: ['weight_loss', 'maintenance', 'weight_gain', 'muscle_gain']
    },
    dietaryPreferences: [{ type: String }],
    allergies: [{ type: String }],
    dailyCalorieGoal: { type: Number, required: true },
    dailyProteinGoal: { type: Number, required: true },
    dailyCarbGoal: { type: Number, required: true },
    dailyFatGoal: { type: Number, required: true }
  },
  preferences: {
    units: { 
      type: String, 
      enum: ['metric', 'imperial'], 
      default: 'metric' 
    },
    notifications: {
      meals: { type: Boolean, default: true },
      water: { type: Boolean, default: true },
      workouts: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
});

// Calculate BMR and daily calorie goals
UserSchema.methods.calculateBMR = function() {
  const { age, gender, weight, height } = this.profile;
  
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  return bmr;
};

UserSchema.methods.calculateTDEE = function() {
  const bmr = this.calculateBMR();
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[this.profile.activityLevel]);
};

UserSchema.methods.calculateMacroGoals = function() {
  const tdee = this.calculateTDEE();
  let calories = tdee;
  
  // Adjust calories based on fitness goal
  switch (this.profile.fitnessGoal) {
    case 'weight_loss':
      calories = tdee - 500; // 500 calorie deficit
      break;
    case 'weight_gain':
      calories = tdee + 500; // 500 calorie surplus
      break;
    case 'muscle_gain':
      calories = tdee + 300; // 300 calorie surplus
      break;
    default:
      calories = tdee;
  }
  
  // Calculate macros (protein: 25%, carbs: 45%, fat: 30%)
  const protein = Math.round((calories * 0.25) / 4); // 4 calories per gram
  const carbs = Math.round((calories * 0.45) / 4); // 4 calories per gram
  const fat = Math.round((calories * 0.30) / 9); // 9 calories per gram
  
  return {
    calories: Math.round(calories),
    protein,
    carbs,
    fat
  };
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);