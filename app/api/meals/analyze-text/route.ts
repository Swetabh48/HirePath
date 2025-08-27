import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';
import { z } from 'zod';

const analyzeTextSchema = z.object({
  description: z.string().min(1),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional()
});

export async function POST(request: NextRequest) {
  try {
    const userToken = getUserFromRequest(request);
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description, mealType } = analyzeTextSchema.parse(body);

    // Use AI service to parse the text description
    const result = await aiService.parseTextualFood(description);

    return NextResponse.json({
      message: 'Text analyzed successfully',
      result,
      suggestedMealType: mealType
    });

  } catch (error) {
    console.error('Analyze text error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}