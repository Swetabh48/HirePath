import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import mealsRouter from './routes/meals.js';
import plansRouter from './routes/plans.js';
import analyticsRouter from './routes/analytics.js';
import uploadRouter from './routes/upload.js';
import notificationsRouter from './routes/notifications.js';
import weightRouter from './routes/weight.js';
import foodRouter from './routes/food.js';
import aiRouter from './routes/ai.js';
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/weight', weightRouter);
app.use('/api/food', foodRouter);
app.use('/api/ai', aiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
});
