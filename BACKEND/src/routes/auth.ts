import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { admins } from '../db/schema.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    if (!admin || !(await comparePassword(password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({ id: admin.id, email: admin.email, role: admin.role });
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }
    const existing = await db.select().from(admins).where(eq(admins.email, email));
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await hashPassword(password);
    const [admin] = await db.insert(admins).values({ name, email, passwordHash, role: role || 'lecturer' }).returning();
    const token = generateToken({ id: admin.id, email: admin.email, role: admin.role });
    res.status(201).json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
