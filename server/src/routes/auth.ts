import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const authRouter = Router();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post('/signup', (req, res) => {
  const parseResult = signupSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const { name, email, password } = parseResult.data;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const id = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, name, email, passwordHash, now, now);

  const token = jwt.sign({ sub: id }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(201).json({
    token,
    user: { id, name, email },
  });
});

authRouter.post('/signin', (req, res) => {
  const parseResult = signinSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const { email, password } = parseResult.data;

  const row = db
    .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
    .get(email) as { id: string; name: string; email: string; password_hash: string } | undefined;
  if (!row) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: row.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: { id: row.id, name: row.name, email: row.email } });
});

authRouter.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const row = db
      .prepare('SELECT id, name, email, avatar FROM users WHERE id = ?')
      .get(payload.sub) as { id: string; name: string; email: string; avatar?: string } | undefined;
    if (!row) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: row });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

