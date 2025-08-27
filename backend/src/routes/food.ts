import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import OpenAI from 'openai';
import { config } from '../config/env.js';

const router = Router();
const openai = new OpenAI({ apiKey: config.openAiApiKey });

let foods: any[] = [];
try {
  const file = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../data/foods.json');
  const json = fs.readFileSync(file, 'utf8');
  foods = JSON.parse(json);
} catch {
  foods = [];
}

router.get('/search', requireAuth, (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  if (!q) return res.json({ items: [] });
  const items = (foods as any[])
    .filter((f) => f.name.toLowerCase().includes(q) || (f.brand || '').toLowerCase().includes(q))
    .slice(0, 20);
  res.json({ items });
});

const parseSchema = z.object({ text: z.string().min(3) });

router.post('/parse-text', requireAuth, async (req, res) => {
  const parsed = parseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { text } = parsed.data;
  const system = 'Extract foods with approximate calories, protein, carbs, and fat. Return JSON array of {name, calories, protein, carbs, fat}.';
  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: text },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });
  const content = result.choices[0].message?.content || '{}';
  const json = JSON.parse(content);
  res.json(json);
});

export default router;

