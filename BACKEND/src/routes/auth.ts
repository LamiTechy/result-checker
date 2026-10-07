import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { admins, students } from '../db/schema.js';
import { hashPassword, comparePassword, generateToken, generateStudentToken } from '../utils/auth.js';
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

router.post('/student/register', async (req: Request, res: Response) => {
  try {
    const { matricNo, surname, pin } = req.body;
    if (!matricNo || !surname || !pin) {
      return res.status(400).json({ error: 'Matric number, surname and PIN required' });
    }
    const trimmedMatric = String(matricNo).trim();
    if (!/^\d{2}\/145\/(?!0000)\d{4}$/.test(trimmedMatric)) {
      return res.status(400).json({ error: 'Invalid matric number. Format: YY/145/0001 (e.g. 24/145/0001)' });
    }
    if (!/^\d{4,6}$/.test(String(pin))) {
      return res.status(400).json({ error: 'PIN must be 4 to 6 digits' });
    }
    const [student] = await db.select().from(students).where(eq(students.matricNo, trimmedMatric));
    if (!student) {
      return res.status(404).json({ error: 'Student not found. Check your matriculation number.' });
    }
    const expectedSurname = student.fullName.toLowerCase().split(' ')[0];
    if (String(surname).trim().toLowerCase() !== expectedSurname) {
      return res.status(403).json({ error: 'Surname does not match our records' });
    }
    if (student.pinHash) {
      return res.status(409).json({ error: 'Account already created. Please sign in.' });
    }
    const pinHash = await hashPassword(String(pin));
    const [updated] = await db.update(students).set({ pinHash }).where(eq(students.id, student.id)).returning();
    const token = generateStudentToken({ id: student.id, matricNo: student.matricNo });
    res.status(201).json({ token, student: { ...updated, pinHash: undefined } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/student/login', async (req: Request, res: Response) => {
  try {
    const { matricNo, pin } = req.body;
    if (!matricNo || !pin) {
      return res.status(400).json({ error: 'Matric number and PIN required' });
    }
    const [student] = await db.select().from(students).where(eq(students.matricNo, String(matricNo).trim()));
    if (!student || !student.pinHash) {
      return res.status(401).json({ error: 'No account found. Please sign up first.' });
    }
    if (!(await comparePassword(String(pin), student.pinHash))) {
      return res.status(401).json({ error: 'Invalid matriculation number or PIN' });
    }
    const token = generateStudentToken({ id: student.id, matricNo: student.matricNo });
    res.json({ token, student: { ...student, pinHash: undefined } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
