import mongoose, { Document, Schema } from 'mongoose';

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  meals: {
    day: number; // 1-7 for weekly plans
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipes: {
      recipeId: mongoose.Types.ObjectId;
      servings: number;
    }[];
    totalNutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  weeklyNutritionGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  preferences: {
    dietaryRestrictions: string[];
    excludedFoods: string[];
    maxPrepTime: number; // in minutes
    budgetRange: {
      min: number;
      max: number;
    };
  };
  generatedBy: 'ai' | 'manual';
  aiPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  meals: [{
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 7
    },
    mealType: {
      type: String,
      required: true,
      enum: ['breakfast', 'lunch', 'dinner', 'snack']
    },
    recipes: [{
      recipeId: {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true
      },
      servings: {
        type: Number,
        required: true,
        min: 0.5
      }
    }],
    totalNutrition: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true }
    }
  }],
  weeklyNutritionGoals: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true }
  },
  preferences: {
    dietaryRestrictions: [{ type: String }],
    excludedFoods: [{ type: String }],
    maxPrepTime: { type: Number, default: 60 },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 1000 }
    }
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'manual'
  },
  aiPrompt: {
    type: String,
    maxlength: 2000
  }
}, {
  timestamps: true
});

export default mongoose.models.MealPlan || mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);