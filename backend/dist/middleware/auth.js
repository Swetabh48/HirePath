import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
export function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token)
        return res.status(401).json({ error: 'Missing token' });
    try {
        const payload = jwt.verify(token, config.jwtSecret);
        req.auth = { userId: payload.userId, role: payload.role };
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
export function requireAdmin(req, res, next) {
    if (!req.auth)
        return res.status(401).json({ error: 'Unauthorized' });
    if (req.auth.role !== 'ADMIN')
        return res.status(403).json({ error: 'Forbidden' });
    next();
}
