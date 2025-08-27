import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import { calculateDailyTargets } from '../utils/nutrition.js';
import { generateMealPlanPrompt } from '../services/ai.js';

const router = Router();

const planRequestSchema = z.object({
  date: z.string().date().optional(),
});

router.get('/', requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const plans = await prisma.mealPlan.findMany({ where: { userId }, include: { items: true }, orderBy: { startDate: 'desc' } });
  res.json({ plans });
});

router.post('/', requireAuth, async (req, res) => {
  // Create a 1-day plan for a date (default today)
  const parsed = planRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const date = parsed.data.date ? new Date(parsed.data.date) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  const userId = req.auth!.userId;
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return res.status(400).json({ error: 'Profile required' });

  const dailyTargets = {
    calories: profile.dailyCalorieTarget ?? 2000,
    proteinGrams: profile.proteinTargetGrams ?? 120,
    carbsGrams: profile.carbsTargetGrams ?? 220,
    fatsGrams: profile.fatsTargetGrams ?? 60,
  };

  const planJson = await generateMealPlanPrompt({
    age: profile.age,
    gender: profile.gender as any,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    dietaryPreferences: profile.dietaryPreferences,
    allergies: profile.allergies,
    dailyTargets,
  });

  const items = (planJson.items || []).map((it: any) => ({
    date: start,
    mealType: it.mealType || 'LUNCH',
    recipeTitle: it.recipeTitle,
    instructions: it.instructions,
    ingredients: it.ingredients,
    portion: it.portion,
    calories: Math.round(Number(it.calories) || 0),
    protein: Math.round(Number(it.protein) || 0),
    carbs: Math.round(Number(it.carbs) || 0),
    fat: Math.round(Number(it.fat) || 0),
  }));

  const plan = await prisma.mealPlan.create({
    data: {
      userId,
      startDate: start,
      endDate: end,
      createdByAi: true,
      items: { create: items },
    },
    include: { items: true },
  });
  res.status(201).json({ plan });
});

export default router;

