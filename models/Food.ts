import mongoose, { Document, Schema } from 'mongoose';

export interface IFood extends Document {
  name: string;
  brand?: string;
  category: string;
  nutrition: {
    calories: number; // per 100g
    protein: number; // grams per 100g
    carbs: number; // grams per 100g
    fat: number; // grams per 100g
    fiber: number; // grams per 100g
    sugar: number; // grams per 100g
    sodium: number; // mg per 100g
    vitamins: {
      vitaminA?: number; // IU per 100g
      vitaminC?: number; // mg per 100g
      vitaminD?: number; // IU per 100g
      vitaminE?: number; // mg per 100g
      vitaminK?: number; // mcg per 100g
      thiamine?: number; // mg per 100g
      riboflavin?: number; // mg per 100g
      niacin?: number; // mg per 100g
      vitaminB6?: number; // mg per 100g
      folate?: number; // mcg per 100g
      vitaminB12?: number; // mcg per 100g
    };
    minerals: {
      calcium?: number; // mg per 100g
      iron?: number; // mg per 100g
      magnesium?: number; // mg per 100g
      phosphorus?: number; // mg per 100g
      potassium?: number; // mg per 100g
      zinc?: number; // mg per 100g
    };
  };
  servingSizes: {
    name: string;
    grams: number;
  }[];
  barcode?: string;
  isVerified: boolean;
  createdBy: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FoodSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'fruits', 'vegetables', 'grains', 'protein', 'dairy', 'nuts_seeds',
      'oils_fats', 'beverages', 'snacks', 'desserts', 'condiments',
      'restaurant', 'fast_food', 'prepared_meals', 'supplements'
    ]
  },
  nutrition: {
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
    fat: { type: Number, required: true, min: 0 },
    fiber: { type: Number, default: 0, min: 0 },
    sugar: { type: Number, default: 0, min: 0 },
    sodium: { type: Number, default: 0, min: 0 },
    vitamins: {
      vitaminA: { type: Number, min: 0 },
      vitaminC: { type: Number, min: 0 },
      vitaminD: { type: Number, min: 0 },
      vitaminE: { type: Number, min: 0 },
      vitaminK: { type: Number, min: 0 },
      thiamine: { type: Number, min: 0 },
      riboflavin: { type: Number, min: 0 },
      niacin: { type: Number, min: 0 },
      vitaminB6: { type: Number, min: 0 },
      folate: { type: Number, min: 0 },
      vitaminB12: { type: Number, min: 0 }
    },
    minerals: {
      calcium: { type: Number, min: 0 },
      iron: { type: Number, min: 0 },
      magnesium: { type: Number, min: 0 },
      phosphorus: { type: Number, min: 0 },
      potassium: { type: Number, min: 0 },
      zinc: { type: Number, min: 0 }
    }
  },
  servingSizes: [{
    name: { type: String, required: true },
    grams: { type: Number, required: true, min: 0 }
  }],
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{ type: String }]
}, {
  timestamps: true
});

// Create text index for search functionality
FoodSchema.index({ 
  name: 'text', 
  brand: 'text', 
  category: 'text',
  tags: 'text'
});

export default mongoose.models.Food || mongoose.model<IFood>('Food', FoodSchema);