import mongoose, { Document, Schema } from 'mongoose';

export interface IRecipe extends Document {
  name: string;
  description: string;
  category: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  ingredients: {
    foodId: mongoose.Types.ObjectId;
    quantity: number; // in grams
    unit: string;
    notes?: string;
  }[];
  instructions: {
    step: number;
    instruction: string;
    duration?: number; // in minutes
  }[];
  nutrition: {
    calories: number; // per serving
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  tags: string[];
  dietaryInfo: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isKeto: boolean;
    isPaleo: boolean;
  };
  images: string[];
  rating: {
    average: number;
    count: number;
  };
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer',
      'side_dish', 'beverage', 'soup', 'salad', 'main_course'
    ]
  },
  cuisine: {
    type: String,
    required: true,
    enum: [
      'american', 'italian', 'mexican', 'chinese', 'indian', 'japanese',
      'mediterranean', 'french', 'thai', 'greek', 'middle_eastern',
      'korean', 'spanish', 'german', 'british', 'other'
    ]
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  prepTime: {
    type: Number,
    required: true,
    min: 0
  },
  cookTime: {
    type: Number,
    required: true,
    min: 0
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  ingredients: [{
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
    unit: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      maxlength: 200
    }
  }],
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true,
      maxlength: 1000
    },
    duration: {
      type: Number,
      min: 0
    }
  }],
  nutrition: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  tags: [{ type: String }],
  dietaryInfo: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isDairyFree: { type: Boolean, default: false },
    isKeto: { type: Boolean, default: false },
    isPaleo: { type: Boolean, default: false }
  },
  images: [{ type: String }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  source: {
    type: String
  }
}, {
  timestamps: true
});

// Text index for recipe search
RecipeSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  category: 'text',
  cuisine: 'text'
});

export default mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);