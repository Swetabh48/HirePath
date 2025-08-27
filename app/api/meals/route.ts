import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MealLog from '@/models/MealLog';
import Food from '@/models/Food';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';
import { startOfDay, endOfDay } from 'date-fns';

const createMealSchema = z.object({
  date: z.string().datetime(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foods: z.array(z.object({
    foodId: z.string(),
    quantity: z.number().min(0)
  })),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  logMethod: z.enum(['manual', 'image', 'barcode']).optional()
});

// GET /api/meals - Get user's meal logs
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let dateFilter: any = { userId: userToken.userId };

    if (dateStr) {
      const date = new Date(dateStr);
      dateFilter.date = {
        $gte: startOfDay(date),
        $lte: endOfDay(date)
      };
    } else if (startDateStr && endDateStr) {
      dateFilter.date = {
        $gte: new Date(startDateStr),
        $lte: new Date(endDateStr)
      };
    }

    const meals = await MealLog.find(dateFilter)
      .populate('foods.foodId', 'name brand category')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await MealLog.countDocuments(dateFilter);

    return NextResponse.json({
      meals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/meals - Log a new meal
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMealSchema.parse(body);

    // Calculate nutrition for each food
    const mealFoods = [];
    for (const foodItem of validatedData.foods) {
      const food = await Food.findById(foodItem.foodId);
      if (!food) {
        return NextResponse.json(
          { error: `Food with ID ${foodItem.foodId} not found` },
          { status: 400 }
        );
      }

      // Calculate nutrition based on quantity (food nutrition is per 100g)
      const multiplier = foodItem.quantity / 100;
      const nutrition = {
        calories: Math.round(food.nutrition.calories * multiplier),
        protein: Math.round(food.nutrition.protein * multiplier * 10) / 10,
        carbs: Math.round(food.nutrition.carbs * multiplier * 10) / 10,
        fat: Math.round(food.nutrition.fat * multiplier * 10) / 10,
        fiber: Math.round((food.nutrition.fiber || 0) * multiplier * 10) / 10,
        sugar: Math.round((food.nutrition.sugar || 0) * multiplier * 10) / 10,
        sodium: Math.round((food.nutrition.sodium || 0) * multiplier)
      };

      mealFoods.push({
        foodId: food._id,
        quantity: foodItem.quantity,
        nutrition
      });
    }

    const mealLog = new MealLog({
      userId: userToken.userId,
      date: new Date(validatedData.date),
      mealType: validatedData.mealType,
      foods: mealFoods,
      notes: validatedData.notes,
      imageUrl: validatedData.imageUrl,
      logMethod: validatedData.logMethod || 'manual'
    });

    await mealLog.save();
    await mealLog.populate('foods.foodId', 'name brand category');

    return NextResponse.json({
      message: 'Meal logged successfully',
      meal: mealLog
    }, { status: 201 });

  } catch (error) {
    console.error('Log meal error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}