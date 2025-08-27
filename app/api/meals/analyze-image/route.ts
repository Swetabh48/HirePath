import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';
import { z } from 'zod';

const analyzeImageSchema = z.object({
  imageBase64: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional()
});

export async function POST(request: NextRequest) {
  try {
    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageBase64, mealType } = analyzeImageSchema.parse(body);

    // Use AI service to analyze the image
    const result = await aiService.recognizeFood(imageBase64);

    return NextResponse.json({
      message: 'Image analyzed successfully',
      result,
      suggestedMealType: mealType
    });

  } catch (error) {
    console.error('Analyze image error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}