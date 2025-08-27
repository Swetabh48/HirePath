import OpenAI from 'openai';
import axios from 'axios';
import { config } from '../config/env.js';

const openai = new OpenAI({ apiKey: config.openAiApiKey });

export async function generateMealPlanPrompt(input: {
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  weightKg: number;
  heightCm: number;
  dietaryPreferences: string[];
  allergies: string[];
  dailyTargets: { calories: number; proteinGrams: number; carbsGrams: number; fatsGrams: number };
}) {
  const { age, gender, weightKg, heightCm, dietaryPreferences, allergies, dailyTargets } = input;
  const prefs = dietaryPreferences?.join(', ') || 'none';
  const allerg = allergies?.join(', ') || 'none';
  const system = `You are a registered dietitian. Create a one-day meal plan (breakfast, lunch, dinner, one snack) with simple recipes and exact portions to meet these macros within ±10%: ${dailyTargets.calories} kcal, ${dailyTargets.proteinGrams}g protein, ${dailyTargets.carbsGrams}g carbs, ${dailyTargets.fatsGrams}g fat. Avoid allergens and respect preferences. Return JSON with fields: items[{mealType, recipeTitle, ingredients, instructions, portion, calories, protein, carbs, fat}]`;
  const user = `Profile: age ${age}, gender ${gender}, weight ${weightKg} kg, height ${heightCm} cm. Preferences: ${prefs}. Allergies: ${allerg}.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });
  const content = response.choices[0].message?.content || '{}';
  return JSON.parse(content);
}

// Simple image recognition stub using third-party API (replace with your provider)
export async function recognizeFoodFromImage(imageUrl: string): Promise<
  Array<{ name: string; confidence: number; calories?: number; protein?: number; carbs?: number; fat?: number }>
> {
  if (!config.foodDbApiKey) {
    return [];
  }
  // Example: hypothetical endpoint
  try {
    const res = await axios.post(
      'https://api.foodvision.example.com/v1/recognize',
      { imageUrl },
      { headers: { Authorization: `Bearer ${config.foodDbApiKey}` } }
    );
    return res.data?.items || [];
  } catch {
    return [];
  }
}

