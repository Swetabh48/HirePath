import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
const router = Router();
const createSchema = z.object({
    type: z.string(),
    content: z.string(),
    scheduledAt: z.string().datetime(),
});
router.get('/', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { scheduledAt: 'asc' } });
    res.json({ notifications });
});
router.post('/', requireAuth, async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const userId = req.auth.userId;
    const { type, content, scheduledAt } = parsed.data;
    const notification = await prisma.notification.create({
        data: { userId, type, content, scheduledAt: new Date(scheduledAt) },
    });
    res.status(201).json({ notification });
});
export default router;
