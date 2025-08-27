import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import { calculateDailyTargets } from '../utils/nutrition.js';
const router = Router();
const profileSchema = z.object({
    age: z.number().int().min(10).max(120),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    heightCm: z.number().positive().max(300),
    weightKg: z.number().positive().max(500),
    activityLevel: z.number().min(1).max(2.5).default(1.2),
    goal: z.enum(['LOSS', 'MAINTAIN', 'GAIN']),
    dietaryPreferences: z.array(z.string()).default([]),
    allergies: z.array(z.string()).default([]),
});
router.get('/', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    res.json({ profile });
});
router.post('/', requireAuth, async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const userId = req.auth.userId;
    const { age, gender, heightCm, weightKg, activityLevel, goal, dietaryPreferences, allergies } = parsed.data;
    const targets = calculateDailyTargets(gender, weightKg, heightCm, age, activityLevel, goal);
    const profile = await prisma.profile.upsert({
        where: { userId },
        update: {
            age,
            gender,
            heightCm,
            weightKg,
            activityLevel,
            goal,
            dietaryPreferences,
            allergies,
            dailyCalorieTarget: targets.calories,
            proteinTargetGrams: targets.proteinGrams,
            carbsTargetGrams: targets.carbsGrams,
            fatsTargetGrams: targets.fatsGrams,
        },
        create: {
            userId,
            age,
            gender,
            heightCm,
            weightKg,
            activityLevel,
            goal,
            dietaryPreferences,
            allergies,
            dailyCalorieTarget: targets.calories,
            proteinTargetGrams: targets.proteinGrams,
            carbsTargetGrams: targets.carbsGrams,
            fatsTargetGrams: targets.fatsGrams,
        },
    });
    res.json({ profile, targets });
});
export default router;
