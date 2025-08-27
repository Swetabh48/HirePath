import mongoose, { Document, Schema } from 'mongoose';

export interface IMealLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: {
    foodId: mongoose.Types.ObjectId;
    quantity: number; // in grams
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugar: number;
      sodium: number;
    };
  }[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  notes?: string;
  imageUrl?: string;
  logMethod: 'manual' | 'image' | 'barcode';
  createdAt: Date;
  updatedAt: Date;
}

const MealLogSchema = new Schema({
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
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  foods: [{
    foodId: {
      type: Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    nutrition: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 }
    }
  }],
  totalNutrition: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  notes: {
    type: String,
    maxlength: 500
  },
  imageUrl: {
    type: String
  },
  logMethod: {
    type: String,
    enum: ['manual', 'image', 'barcode'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Compound index for efficient date range queries
MealLogSchema.index({ userId: 1, date: 1 });

// Calculate total nutrition before saving
MealLogSchema.pre('save', function(next) {
  const totalNutrition = this.foods.reduce((total, food) => {
    total.calories += food.nutrition.calories;
    total.protein += food.nutrition.protein;
    total.carbs += food.nutrition.carbs;
    total.fat += food.nutrition.fat;
    total.fiber += food.nutrition.fiber;
    total.sugar += food.nutrition.sugar;
    total.sodium += food.nutrition.sodium;
    return total;
  }, {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  });
  
  this.totalNutrition = totalNutrition;
  next();
});

export default mongoose.models.MealLog || mongoose.model<IMealLog>('MealLog', MealLogSchema);