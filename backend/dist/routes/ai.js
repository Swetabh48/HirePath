import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import OpenAI from 'openai';
import { config } from '../config/env.js';
import { prisma } from '../config/prisma.js';
const router = Router();
const openai = new OpenAI({ apiKey: config.openAiApiKey });
router.get('/tips', requireAuth, async (req, res) => {
    const userId = req.auth.userId;
    const [profile, recentMeals] = await Promise.all([
        prisma.profile.findUnique({ where: { userId } }),
        prisma.meal.findMany({ where: { userId }, orderBy: { occurredAt: 'desc' }, take: 5 }),
    ]);
    const info = {
        profile,
        todayCalories: recentMeals.reduce((a, m) => a + m.totalCalories, 0),
    };
    if (!config.openAiApiKey) {
        return res.json({ tips: [
                'Increase protein at breakfast to improve satiety.',
                'Plan snacks with fruit and yogurt to avoid over-eating later.',
                'Drink a glass of water before meals.',
            ] });
    }
    const system = 'Provide 3 concise, practical nutrition tips tailored to the user. Output JSON: {"tips": string[]}';
    const user = JSON.stringify(info);
    const r = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        temperature: 0.5,
        response_format: { type: 'json_object' },
    });
    const content = r.choices[0].message?.content || '{}';
    return res.json(JSON.parse(content));
});
export default router;
