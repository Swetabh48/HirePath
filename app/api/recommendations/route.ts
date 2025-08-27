import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import MealLog from '@/models/MealLog';
import { getUserFromRequest } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const user = await User.findById(userToken.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent meal logs (last 7 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentLogs = await MealLog.find({
      userId: userToken.userId,
      date: { $gte: sevenDaysAgo }
    }).populate('foods.foodId', 'name category');

    // Get AI-powered nutritional tips
    const nutritionalTips = await aiService.getNutritionalTips(user.profile, recentLogs);

    // Calculate basic nutritional analysis
    const totalNutrition = recentLogs.reduce((total, log) => {
      total.calories += log.totalNutrition.calories;
      total.protein += log.totalNutrition.protein;
      total.carbs += log.totalNutrition.carbs;
      total.fat += log.totalNutrition.fat;
      return total;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const dailyAverage = {
      calories: totalNutrition.calories / 7,
      protein: totalNutrition.protein / 7,
      carbs: totalNutrition.carbs / 7,
      fat: totalNutrition.fat / 7
    };

    // Generate specific recommendations based on goals and recent intake
    const recommendations = generateRecommendations(user.profile, dailyAverage, recentLogs);

    return NextResponse.json({
      recommendations: {
        aiTips: nutritionalTips,
        personalizedTips: recommendations.tips,
        foodSuggestions: recommendations.foodSuggestions,
        goalProgress: recommendations.goalProgress
      },
      nutritionalAnalysis: {
        weeklyAverage: dailyAverage,
        dailyGoals: {
          calories: user.profile.dailyCalorieGoal,
          protein: user.profile.dailyProteinGoal,
          carbs: user.profile.dailyCarbGoal,
          fat: user.profile.dailyFatGoal
        },
        adherenceRate: calculateAdherenceRate(dailyAverage, user.profile)
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateRecommendations(profile: any, dailyAverage: any, recentLogs: any[]) {
  const tips = [];
  const foodSuggestions = [];
  const goalProgress = {
    onTrack: true,
    areas: []
  };

  // Calorie analysis
  const calorieDeficit = profile.dailyCalorieGoal - dailyAverage.calories;
  if (Math.abs(calorieDeficit) > 200) {
    if (calorieDeficit > 200) {
      tips.push("You're eating fewer calories than your goal. Consider adding healthy snacks or larger portions.");
      foodSuggestions.push("nuts", "avocado", "olive oil", "whole grain bread");
    } else {
      tips.push("You're exceeding your calorie goal. Try reducing portion sizes or choosing lower-calorie alternatives.");
      foodSuggestions.push("vegetables", "lean proteins", "fruits", "water");
    }
    goalProgress.onTrack = false;
    goalProgress.areas.push('calories');
  }

  // Protein analysis
  const proteinDeficit = profile.dailyProteinGoal - dailyAverage.protein;
  if (proteinDeficit > 10) {
    tips.push("Increase your protein intake to support your fitness goals. Aim for protein at every meal.");
    foodSuggestions.push("chicken breast", "fish", "eggs", "Greek yogurt", "beans");
    goalProgress.onTrack = false;
    goalProgress.areas.push('protein');
  }

  // Fiber recommendation (general health)
  tips.push("Include more fiber-rich foods to support digestion and satiety.");
  foodSuggestions.push("broccoli", "quinoa", "beans", "berries", "oats");

  // Hydration reminder
  tips.push("Remember to stay hydrated! Aim for at least 8 glasses of water daily.");

  // Meal frequency analysis
  const avgMealsPerDay = recentLogs.length / 7;
  if (avgMealsPerDay < 3) {
    tips.push("Try to eat regular meals throughout the day to maintain stable energy levels.");
  }

  // Goal-specific recommendations
  switch (profile.fitnessGoal) {
    case 'weight_loss':
      tips.push("Focus on high-volume, low-calorie foods like vegetables and lean proteins.");
      foodSuggestions.push("spinach", "cucumber", "chicken breast", "cauliflower");
      break;
    case 'muscle_gain':
      tips.push("Ensure adequate protein and calories to support muscle growth.");
      foodSuggestions.push("salmon", "quinoa", "sweet potato", "almonds");
      break;
    case 'weight_gain':
      tips.push("Include calorie-dense, nutritious foods to support healthy weight gain.");
      foodSuggestions.push("peanut butter", "banana", "whole milk", "oats");
      break;
  }

  return {
    tips: tips.slice(0, 5), // Limit to 5 tips
    foodSuggestions: [...new Set(foodSuggestions)].slice(0, 8), // Unique suggestions, limit to 8
    goalProgress
  };
}

function calculateAdherenceRate(dailyAverage: any, profile: any) {
  const calorieAdherence = Math.max(0, 100 - Math.abs(profile.dailyCalorieGoal - dailyAverage.calories) / profile.dailyCalorieGoal * 100);
  const proteinAdherence = Math.max(0, 100 - Math.abs(profile.dailyProteinGoal - dailyAverage.protein) / profile.dailyProteinGoal * 100);
  const carbAdherence = Math.max(0, 100 - Math.abs(profile.dailyCarbGoal - dailyAverage.carbs) / profile.dailyCarbGoal * 100);
  const fatAdherence = Math.max(0, 100 - Math.abs(profile.dailyFatGoal - dailyAverage.fat) / profile.dailyFatGoal * 100);

  return Math.round((calorieAdherence + proteinAdherence + carbAdherence + fatAdherence) / 4);
}