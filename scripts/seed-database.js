const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrition-tracker');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Food schema (simplified for seeding)
const foodSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  servingSizes: [{
    name: String,
    grams: Number
  }],
  isVerified: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String]
}, { timestamps: true });

const Food = mongoose.model('Food', foodSchema);

// Sample food data
const sampleFoods = [
  // Fruits
  {
    name: 'Apple',
    category: 'fruits',
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 },
    servingSizes: [{ name: 'Medium apple', grams: 182 }, { name: 'Large apple', grams: 223 }],
    isVerified: true,
    tags: ['fresh', 'raw', 'healthy']
  },
  {
    name: 'Banana',
    category: 'fruits',
    nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
    servingSizes: [{ name: 'Medium banana', grams: 118 }, { name: 'Large banana', grams: 136 }],
    isVerified: true,
    tags: ['fresh', 'raw', 'potassium']
  },
  {
    name: 'Orange',
    category: 'fruits',
    nutrition: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9, sodium: 0 },
    servingSizes: [{ name: 'Medium orange', grams: 154 }],
    isVerified: true,
    tags: ['fresh', 'citrus', 'vitamin-c']
  },

  // Vegetables
  {
    name: 'Broccoli',
    category: 'vegetables',
    nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33 },
    servingSizes: [{ name: 'Cup chopped', grams: 91 }, { name: 'Medium stalk', grams: 148 }],
    isVerified: true,
    tags: ['green', 'cruciferous', 'vitamin-k']
  },
  {
    name: 'Spinach',
    category: 'vegetables',
    nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
    servingSizes: [{ name: 'Cup raw', grams: 30 }, { name: 'Cup cooked', grams: 180 }],
    isVerified: true,
    tags: ['leafy-green', 'iron', 'folate']
  },
  {
    name: 'Carrot',
    category: 'vegetables',
    nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
    servingSizes: [{ name: 'Medium carrot', grams: 61 }, { name: 'Cup chopped', grams: 128 }],
    isVerified: true,
    tags: ['orange', 'beta-carotene', 'crunchy']
  },

  // Proteins
  {
    name: 'Chicken Breast',
    category: 'protein',
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
    servingSizes: [{ name: '3 oz serving', grams: 85 }, { name: '4 oz serving', grams: 113 }],
    isVerified: true,
    tags: ['lean', 'poultry', 'high-protein']
  },
  {
    name: 'Salmon',
    category: 'protein',
    nutrition: { calories: 208, protein: 22, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 59 },
    servingSizes: [{ name: '3 oz fillet', grams: 85 }, { name: '6 oz fillet', grams: 170 }],
    isVerified: true,
    tags: ['fish', 'omega-3', 'healthy-fats']
  },
  {
    name: 'Eggs',
    category: 'protein',
    nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
    servingSizes: [{ name: 'Large egg', grams: 50 }, { name: '2 large eggs', grams: 100 }],
    isVerified: true,
    tags: ['whole-food', 'versatile', 'choline']
  },

  // Grains
  {
    name: 'Brown Rice',
    category: 'grains',
    nutrition: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5 },
    servingSizes: [{ name: 'Cup cooked', grams: 195 }, { name: 'Half cup cooked', grams: 98 }],
    isVerified: true,
    tags: ['whole-grain', 'complex-carbs', 'gluten-free']
  },
  {
    name: 'Quinoa',
    category: 'grains',
    nutrition: { calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5.2, sugar: 1.6, sodium: 13 },
    servingSizes: [{ name: 'Cup cooked', grams: 185 }],
    isVerified: true,
    tags: ['complete-protein', 'gluten-free', 'superfood']
  },
  {
    name: 'Oats',
    category: 'grains',
    nutrition: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6, sugar: 0.99, sodium: 2 },
    servingSizes: [{ name: 'Cup dry', grams: 81 }, { name: 'Half cup dry', grams: 40 }],
    isVerified: true,
    tags: ['breakfast', 'fiber', 'heart-healthy']
  },

  // Dairy
  {
    name: 'Greek Yogurt',
    category: 'dairy',
    nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 36 },
    servingSizes: [{ name: 'Cup plain', grams: 170 }, { name: 'Container 6oz', grams: 170 }],
    isVerified: true,
    tags: ['probiotic', 'high-protein', 'calcium']
  },
  {
    name: 'Milk',
    category: 'dairy',
    nutrition: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44 },
    servingSizes: [{ name: 'Cup 1%', grams: 244 }],
    isVerified: true,
    tags: ['calcium', 'vitamin-d', 'beverage']
  },

  // Nuts and Seeds
  {
    name: 'Almonds',
    category: 'nuts_seeds',
    nutrition: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, sugar: 4.4, sodium: 1 },
    servingSizes: [{ name: 'Handful (23 almonds)', grams: 28 }, { name: 'Quarter cup', grams: 32 }],
    isVerified: true,
    tags: ['healthy-fats', 'vitamin-e', 'snack']
  },
  {
    name: 'Chia Seeds',
    category: 'nuts_seeds',
    nutrition: { calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34, sugar: 0, sodium: 16 },
    servingSizes: [{ name: 'Tablespoon', grams: 12 }, { name: '2 tablespoons', grams: 24 }],
    isVerified: true,
    tags: ['omega-3', 'fiber', 'superfood']
  },

  // Fast Food Examples
  {
    name: 'Big Mac',
    brand: "McDonald's",
    category: 'fast_food',
    nutrition: { calories: 563, protein: 25, carbs: 45, fat: 33, fiber: 3, sugar: 9, sodium: 1040 },
    servingSizes: [{ name: '1 burger', grams: 230 }],
    isVerified: true,
    tags: ['fast-food', 'burger', 'high-sodium']
  },
  {
    name: 'Caesar Salad',
    brand: 'Various',
    category: 'restaurant',
    nutrition: { calories: 170, protein: 3, carbs: 13, fat: 13, fiber: 3, sugar: 2, sodium: 377 },
    servingSizes: [{ name: 'Side salad', grams: 100 }, { name: 'Entree salad', grams: 200 }],
    isVerified: true,
    tags: ['salad', 'restaurant', 'lettuce']
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing foods
    await Food.deleteMany({});
    console.log('Cleared existing foods');

    // Create a dummy user ID for the created foods
    const dummyUserId = new mongoose.Types.ObjectId();

    // Add createdBy to all foods
    const foodsWithCreator = sampleFoods.map(food => ({
      ...food,
      createdBy: dummyUserId
    }));

    // Insert sample foods
    await Food.insertMany(foodsWithCreator);
    console.log(`Inserted ${sampleFoods.length} sample foods`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();