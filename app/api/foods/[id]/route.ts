import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Food from '@/models/Food';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/foods/[id] - Get food by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const food = await Food.findById(params.id)
      .populate('createdBy', 'profile.firstName profile.lastName');

    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    return NextResponse.json({ food });

  } catch (error) {
    console.error('Get food error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/foods/[id] - Update food
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const food = await Food.findById(params.id);
    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    // Check if user owns this food or is admin
    if (food.createdBy.toString() !== userToken.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedFood = await Food.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Food updated successfully',
      food: updatedFood
    });

  } catch (error) {
    console.error('Update food error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/foods/[id] - Delete food
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const food = await Food.findById(params.id);
    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    // Check if user owns this food
    if (food.createdBy.toString() !== userToken.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Food.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Food deleted successfully' });

  } catch (error) {
    console.error('Delete food error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}