import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export interface FoodRecognitionResult {
  foods: {
    name: string;
    confidence: number;
    estimatedWeight: number; // in grams
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  description: string;
}

export interface MealPlanRequest {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  dietaryPreferences: string[];
  allergies: string[];
  daysCount: number;
  excludedFoods?: string[];
  cuisinePreferences?: string[];
}

export interface GeneratedMealPlan {
  meals: {
    day: number;
    breakfast: MealSuggestion;
    lunch: MealSuggestion;
    dinner: MealSuggestion;
    snacks: MealSuggestion[];
  }[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  shoppingList: string[];
}

export interface MealSuggestion {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  prepTime: number;
  servings: number;
}

export class AIService {
  private model = openai('gpt-4-turbo');

  async recognizeFood(imageBase64: string): Promise<FoodRecognitionResult> {
    const prompt = `
    Analyze this food image and identify all visible food items. For each food item, provide:
    1. Name of the food
    2. Confidence level (0-1)
    3. Estimated weight/portion size in grams
    4. Nutritional information (calories, protein, carbs, fat per estimated portion)
    
    Return the response as a JSON object with the following structure:
    {
      "foods": [
        {
          "name": "string",
          "confidence": number,
          "estimatedWeight": number,
          "nutrition": {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          }
        }
      ],
      "description": "string describing what you see in the image"
    }
    
    Be as accurate as possible with portion size estimation. If you can't clearly identify a food item, don't include it.
    `;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 1000,
      });

      return JSON.parse(text);
    } catch (error) {
      console.error('Error recognizing food:', error);
      throw new Error('Failed to analyze food image');
    }
  }

  async generateMealPlan(request: MealPlanRequest): Promise<GeneratedMealPlan> {
    const prompt = `
    Create a ${request.daysCount}-day meal plan with the following requirements:
    
    Daily Nutrition Goals:
    - Calories: ${request.calories}
    - Protein: ${request.protein}g
    - Carbs: ${request.carbs}g
    - Fat: ${request.fat}g
    
    Dietary Preferences: ${request.dietaryPreferences.join(', ') || 'None'}
    Allergies/Restrictions: ${request.allergies.join(', ') || 'None'}
    Excluded Foods: ${request.excludedFoods?.join(', ') || 'None'}
    Cuisine Preferences: ${request.cuisinePreferences?.join(', ') || 'Any'}
    
    For each day, provide breakfast, lunch, dinner, and 1-2 snacks. Each meal should include:
    - Recipe name and description
    - Detailed ingredient list with quantities
    - Step-by-step cooking instructions
    - Accurate nutritional information
    - Preparation time
    - Number of servings
    
    Also provide a consolidated shopping list for all meals.
    
    Return as JSON with this structure:
    {
      "meals": [
        {
          "day": number,
          "breakfast": {meal_object},
          "lunch": {meal_object},
          "dinner": {meal_object},
          "snacks": [{meal_object}]
        }
      ],
      "totalNutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      },
      "shoppingList": ["ingredient1", "ingredient2"]
    }
    
    Where meal_object is:
    {
      "name": "string",
      "description": "string",
      "ingredients": ["ingredient with quantity"],
      "instructions": ["step1", "step2"],
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      },
      "prepTime": number,
      "servings": number
    }
    
    Ensure the daily nutrition totals are close to the target goals.
    `;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 4000,
      });

      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw new Error('Failed to generate meal plan');
    }
  }

  async getNutritionalTips(userProfile: any, recentLogs: any[]): Promise<string[]> {
    const prompt = `
    Based on the user profile and recent meal logs, provide 3-5 personalized nutritional tips:
    
    User Profile:
    - Age: ${userProfile.age}
    - Gender: ${userProfile.gender}
    - Weight: ${userProfile.weight}kg
    - Height: ${userProfile.height}cm
    - Goal: ${userProfile.fitnessGoal}
    - Activity Level: ${userProfile.activityLevel}
    - Dietary Preferences: ${userProfile.dietaryPreferences.join(', ')}
    - Allergies: ${userProfile.allergies.join(', ')}
    
    Recent Meal Logs (last 7 days):
    ${JSON.stringify(recentLogs, null, 2)}
    
    Provide actionable, personalized tips to help them achieve their fitness goals.
    Return as a JSON array of strings: ["tip1", "tip2", "tip3"]
    `;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 500,
      });

      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating nutritional tips:', error);
      return [
        'Stay hydrated by drinking at least 8 glasses of water daily',
        'Include a variety of colorful fruits and vegetables in your meals',
        'Consider meal prepping to maintain consistent nutrition'
      ];
    }
  }

  async parseTextualFood(description: string): Promise<FoodRecognitionResult> {
    const prompt = `
    Parse this food description and extract nutritional information: "${description}"
    
    Identify individual food items mentioned and provide nutritional estimates.
    If quantities are mentioned, use those. Otherwise, estimate reasonable portion sizes.
    
    Return as JSON with this structure:
    {
      "foods": [
        {
          "name": "string",
          "confidence": number,
          "estimatedWeight": number,
          "nutrition": {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          }
        }
      ],
      "description": "parsed description of the meal"
    }
    `;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 800,
      });

      return JSON.parse(text);
    } catch (error) {
      console.error('Error parsing textual food:', error);
      throw new Error('Failed to parse food description');
    }
  }
}

export const aiService = new AIService();