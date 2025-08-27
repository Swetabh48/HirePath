import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/daily-summary', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const day = req.query.date ? new Date(String(req.query.date)) : new Date();
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const [meals, profile] = await Promise.all([
        prisma.meal.findMany({ where: { userId, occurredAt: { gte: start, lt: end } } }),
        prisma.profile.findUnique({ where: { userId } }),
    ]);
    const totals = meals.reduce((acc, m) => {
        acc.calories += m.totalCalories;
        acc.protein += m.totalProtein;
        acc.carbs += m.totalCarbs;
        acc.fat += m.totalFat;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const targets = profile
        ? {
            calories: profile.dailyCalorieTarget ?? 2000,
            protein: profile.proteinTargetGrams ?? 120,
            carbs: profile.carbsTargetGrams ?? 220,
            fat: profile.fatsTargetGrams ?? 60,
        }
        : undefined;
    res.json({ date: start, totals, targets, remaining: targets && {
            calories: targets.calories - totals.calories,
            protein: targets.protein - totals.protein,
            carbs: targets.carbs - totals.carbs,
            fat: targets.fat - totals.fat,
        } });
});
router.get('/progress', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const logs = await prisma.progressLog.findMany({ where: { userId }, orderBy: { date: 'asc' } });
    res.json({ logs });
});
export default router;
