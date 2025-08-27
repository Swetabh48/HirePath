import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, age, gender, heightCm, weightKg, goal, dietaryPreferences, allergies } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      name,
      age,
      gender,
      heightCm,
      weightKg,
      goal,
      dietaryPreferences: dietaryPreferences || [],
      allergies: allergies || []
    });
    const token = jwt.sign({ id: user._id.toHexString(), role: user.role }, env.jwtSecret, { expiresIn: '7d' });
    return res.status(201).json({ token, user: sanitize(user.toObject()) });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id.toHexString(), role: user.role }, env.jwtSecret, { expiresIn: '7d' });
    return res.json({ token, user: sanitize(user.toObject()) });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
}

function sanitize(u: any) {
  delete u.passwordHash;
  return u;
}

