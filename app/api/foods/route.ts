import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Food from '@/models/Food';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const createFoodSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  category: z.enum([
    'fruits', 'vegetables', 'grains', 'protein', 'dairy', 'nuts_seeds',
    'oils_fats', 'beverages', 'snacks', 'desserts', 'condiments',
    'restaurant', 'fast_food', 'prepared_meals', 'supplements'
  ]),
  nutrition: z.object({
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().min(0).optional(),
    sugar: z.number().min(0).optional(),
    sodium: z.number().min(0).optional()
  }),
  servingSizes: z.array(z.object({
    name: z.string(),
    grams: z.number().min(0)
  })),
  barcode: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// GET /api/foods - Search foods
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let searchFilter: any = {};

    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    if (category) {
      searchFilter.category = category;
    }

    const foods = await Food.find(searchFilter)
      .populate('createdBy', 'profile.firstName profile.lastName')
      .sort({ isVerified: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Food.countDocuments(searchFilter);

    return NextResponse.json({
      foods,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search foods error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/foods - Create new food
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createFoodSchema.parse(body);

    const food = new Food({
      ...validatedData,
      createdBy: userToken.userId
    });

    await food.save();

    return NextResponse.json({
      message: 'Food created successfully',
      food
    }, { status: 201 });

  } catch (error) {
    console.error('Create food error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}