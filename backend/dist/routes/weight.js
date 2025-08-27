import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
const router = Router();
const logSchema = z.object({
    date: z.string().datetime().optional(),
    weightKg: z.number().positive(),
    bmi: z.number().positive().optional(),
    notes: z.string().optional(),
});
router.get('/', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const logs = await prisma.progressLog.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    res.json({ logs });
});
router.post('/', requireAuth, async (req, res) => {
    const parsed = logSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const userId = req.auth.userId;
    const { date, weightKg, bmi, notes } = parsed.data;
    const log = await prisma.progressLog.upsert({
        where: { userId_date: { userId, date: date ? new Date(date) : new Date(new Date().setHours(0, 0, 0, 0)) } },
        create: { userId, date: date ? new Date(date) : new Date(), weightKg, bmi, notes },
        update: { weightKg, bmi, notes },
    });
    res.status(201).json({ log });
});
export default router;
