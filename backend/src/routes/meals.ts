import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import { sumNutrients } from '../utils/nutrition.js';

const router = Router();

const foodItemSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  quantity: z.number().positive().default(1),
  unit: z.string().default('serving'),
  calories: z.number().int().nonnegative().default(0),
  protein: z.number().int().nonnegative().default(0),
  carbs: z.number().int().nonnegative().default(0),
  fat: z.number().int().nonnegative().default(0),
  micronutrients: z.record(z.any()).optional(),
});

const createMealSchema = z.object({
  occurredAt: z.string().datetime().optional(),
  note: z.string().optional(),
  items: z.array(foodItemSchema).min(1),
});

router.get('/', requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const { start, end } = req.query as { start?: string; end?: string };
  const where: any = { userId };
  if (start || end) where.occurredAt = {};
  if (start) where.occurredAt.gte = new Date(start);
  if (end) where.occurredAt.lte = new Date(end);
  const meals = await prisma.meal.findMany({ where, include: { items: true }, orderBy: { occurredAt: 'desc' } });
  res.json({ meals });
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = createMealSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const userId = req.auth!.userId;
  const { occurredAt, note, items } = parsed.data;
  const totals = sumNutrients(items.map((i) => ({ calories: i.calories, protein: i.protein, carbs: i.carbs, fat: i.fat })));

  const meal = await prisma.meal.create({
    data: {
      userId,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      note,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      items: { create: items },
    },
    include: { items: true },
  });
  res.status(201).json({ meal });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const { id } = req.params;
  const meal = await prisma.meal.findUnique({ where: { id } });
  if (!meal || meal.userId !== userId) return res.status(404).json({ error: 'Not found' });
  await prisma.foodItem.deleteMany({ where: { mealId: id } });
  await prisma.meal.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;

