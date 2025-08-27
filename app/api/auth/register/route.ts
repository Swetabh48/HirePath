import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  profile: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    age: z.number().min(1).max(120),
    gender: z.enum(['male', 'female', 'other']),
    weight: z.number().min(1),
    height: z.number().min(1),
    activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']),
    fitnessGoal: z.enum(['weight_loss', 'maintenance', 'weight_gain', 'muscle_gain']),
    dietaryPreferences: z.array(z.string()).optional().default([]),
    allergies: z.array(z.string()).optional().default([])
  })
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user with calculated nutrition goals
    const userData = {
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      profile: validatedData.profile
    };

    const user = new User(userData);
    
    // Calculate and set nutrition goals
    const macroGoals = user.calculateMacroGoals();
    user.profile.dailyCalorieGoal = macroGoals.calories;
    user.profile.dailyProteinGoal = macroGoals.protein;
    user.profile.dailyCarbGoal = macroGoals.carbs;
    user.profile.dailyFatGoal = macroGoals.fat;

    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      profile: user.profile,
      preferences: user.preferences
    };

    const response = NextResponse.json({
      message: 'User registered successfully',
      user: userResponse,
      token
    }, { status: 201 });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}