import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MealPlan from '@/models/MealPlan';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';
import { z } from 'zod';

const generateMealPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  daysCount: z.number().min(1).max(30),
  startDate: z.string().datetime(),
  preferences: z.object({
    dietaryRestrictions: z.array(z.string()).optional(),
    excludedFoods: z.array(z.string()).optional(),
    maxPrepTime: z.number().optional(),
    budgetRange: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    cuisinePreferences: z.array(z.string()).optional()
  }).optional()
});

// GET /api/meal-plans - Get user's meal plans
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const active = searchParams.get('active');

    let filter: any = { userId: userToken.userId };
    if (active === 'true') {
      filter.isActive = true;
    }

    const mealPlans = await MealPlan.find(filter)
      .populate('meals.recipes.recipeId', 'name description nutrition images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await MealPlan.countDocuments(filter);

    return NextResponse.json({
      mealPlans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get meal plans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/meal-plans - Generate a new meal plan
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = generateMealPlanSchema.parse(body);

    // Get user profile for nutrition goals
    const user = await User.findById(userToken.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare AI request
    const aiRequest = {
      calories: user.profile.dailyCalorieGoal,
      protein: user.profile.dailyProteinGoal,
      carbs: user.profile.dailyCarbGoal,
      fat: user.profile.dailyFatGoal,
      dietaryPreferences: user.profile.dietaryPreferences,
      allergies: user.profile.allergies,
      daysCount: validatedData.daysCount,
      excludedFoods: validatedData.preferences?.excludedFoods || [],
      cuisinePreferences: validatedData.preferences?.cuisinePreferences || []
    };

    // Generate meal plan using AI
    const generatedPlan = await aiService.generateMealPlan(aiRequest);

    // Calculate end date
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + validatedData.daysCount - 1);

    // Create meal plan document
    const mealPlan = new MealPlan({
      userId: userToken.userId,
      name: validatedData.name,
      description: validatedData.description,
      startDate,
      endDate,
      meals: [], // We'll populate this with the generated data
      weeklyNutritionGoals: {
        calories: user.profile.dailyCalorieGoal * 7,
        protein: user.profile.dailyProteinGoal * 7,
        carbs: user.profile.dailyCarbGoal * 7,
        fat: user.profile.dailyFatGoal * 7
      },
      preferences: validatedData.preferences || {},
      generatedBy: 'ai',
      aiPrompt: `Generate ${validatedData.daysCount}-day meal plan for user with ${aiRequest.calories} daily calories`
    });

    await mealPlan.save();

    return NextResponse.json({
      message: 'Meal plan generated successfully',
      mealPlan,
      generatedData: generatedPlan
    }, { status: 201 });

  } catch (error) {
    console.error('Generate meal plan error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}