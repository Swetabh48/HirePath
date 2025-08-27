import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MealLog from '@/models/MealLog';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString();
    const date = new Date(dateStr);

    // Get user's nutrition goals
    const user = await User.findById(userToken.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all meals for the specified date
    const meals = await MealLog.find({
      userId: userToken.userId,
      date: {
        $gte: startOfDay(date),
        $lte: endOfDay(date)
      }
    }).populate('foods.foodId', 'name brand');

    // Calculate total nutrition for the day
    const totalNutrition = meals.reduce((total, meal) => {
      total.calories += meal.totalNutrition.calories;
      total.protein += meal.totalNutrition.protein;
      total.carbs += meal.totalNutrition.carbs;
      total.fat += meal.totalNutrition.fat;
      total.fiber += meal.totalNutrition.fiber;
      total.sugar += meal.totalNutrition.sugar;
      total.sodium += meal.totalNutrition.sodium;
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

    // Calculate remaining targets
    const goals = user.profile;
    const remaining = {
      calories: Math.max(0, goals.dailyCalorieGoal - totalNutrition.calories),
      protein: Math.max(0, goals.dailyProteinGoal - totalNutrition.protein),
      carbs: Math.max(0, goals.dailyCarbGoal - totalNutrition.carbs),
      fat: Math.max(0, goals.dailyFatGoal - totalNutrition.fat)
    };

    // Calculate percentages
    const percentages = {
      calories: Math.round((totalNutrition.calories / goals.dailyCalorieGoal) * 100),
      protein: Math.round((totalNutrition.protein / goals.dailyProteinGoal) * 100),
      carbs: Math.round((totalNutrition.carbs / goals.dailyCarbGoal) * 100),
      fat: Math.round((totalNutrition.fat / goals.dailyFatGoal) * 100)
    };

    // Group meals by type
    const mealsByType = {
      breakfast: meals.filter(m => m.mealType === 'breakfast'),
      lunch: meals.filter(m => m.mealType === 'lunch'),
      dinner: meals.filter(m => m.mealType === 'dinner'),
      snack: meals.filter(m => m.mealType === 'snack')
    };

    return NextResponse.json({
      date: dateStr,
      totalNutrition,
      goals: {
        calories: goals.dailyCalorieGoal,
        protein: goals.dailyProteinGoal,
        carbs: goals.dailyCarbGoal,
        fat: goals.dailyFatGoal
      },
      remaining,
      percentages,
      mealsByType,
      totalMeals: meals.length
    });

  } catch (error) {
    console.error('Get meal summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}