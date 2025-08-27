import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Progress from '@/models/Progress';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';
import { startOfDay, endOfDay, subDays } from 'date-fns';

const createProgressSchema = z.object({
  date: z.string().datetime(),
  weight: z.number().min(1).max(1000).optional(),
  bodyMeasurements: z.object({
    waist: z.number().min(1).optional(),
    chest: z.number().min(1).optional(),
    hips: z.number().min(1).optional(),
    arms: z.number().min(1).optional(),
    thighs: z.number().min(1).optional()
  }).optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).optional(),
  photos: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
  mood: z.enum(['excellent', 'good', 'average', 'poor', 'terrible']).optional(),
  energyLevel: z.number().min(1).max(5).optional(),
  workoutCompleted: z.boolean().optional(),
  waterIntake: z.number().min(0).optional(),
  sleepHours: z.number().min(0).max(24).optional()
});

// GET /api/progress - Get user's progress entries
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const days = parseInt(searchParams.get('days') || '30');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let dateFilter: any = { userId: userToken.userId };

    if (startDateStr && endDateStr) {
      dateFilter.date = {
        $gte: new Date(startDateStr),
        $lte: new Date(endDateStr)
      };
    } else {
      // Default to last X days
      const endDate = new Date();
      const startDate = subDays(endDate, days);
      dateFilter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const progressEntries = await Progress.find(dateFilter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Progress.countDocuments(dateFilter);

    // Calculate trends
    const recentEntries = await Progress.find({
      userId: userToken.userId,
      date: { $gte: subDays(new Date(), 30) }
    }).sort({ date: 1 });

    const trends = calculateTrends(recentEntries);

    return NextResponse.json({
      progress: progressEntries,
      trends,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/progress - Log progress entry
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProgressSchema.parse(body);

    const date = new Date(validatedData.date);

    // Check if entry already exists for this date
    const existingEntry = await Progress.findOne({
      userId: userToken.userId,
      date: {
        $gte: startOfDay(date),
        $lte: endOfDay(date)
      }
    });

    let progress;
    if (existingEntry) {
      // Update existing entry
      progress = await Progress.findByIdAndUpdate(
        existingEntry._id,
        { ...validatedData, date },
        { new: true, runValidators: true }
      );
    } else {
      // Create new entry
      progress = new Progress({
        userId: userToken.userId,
        ...validatedData,
        date
      });
      await progress.save();
    }

    return NextResponse.json({
      message: existingEntry ? 'Progress updated successfully' : 'Progress logged successfully',
      progress
    }, { status: existingEntry ? 200 : 201 });

  } catch (error) {
    console.error('Log progress error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateTrends(entries: any[]) {
  if (entries.length < 2) {
    return {
      weight: { change: 0, direction: 'stable' },
      averageMood: 3,
      averageEnergyLevel: 3,
      workoutFrequency: 0
    };
  }

  const weights = entries.filter(e => e.weight).map(e => e.weight);
  const weightChange = weights.length >= 2 ? weights[weights.length - 1] - weights[0] : 0;
  
  const moods = entries.filter(e => e.mood).map(e => {
    const moodValues = { terrible: 1, poor: 2, average: 3, good: 4, excellent: 5 };
    return moodValues[e.mood as keyof typeof moodValues];
  });
  
  const energyLevels = entries.filter(e => e.energyLevel).map(e => e.energyLevel);
  const workouts = entries.filter(e => e.workoutCompleted).length;

  return {
    weight: {
      change: weightChange,
      direction: weightChange > 0 ? 'increasing' : weightChange < 0 ? 'decreasing' : 'stable'
    },
    averageMood: moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : 3,
    averageEnergyLevel: energyLevels.length ? energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length : 3,
    workoutFrequency: Math.round((workouts / entries.length) * 100)
  };
}