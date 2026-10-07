import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: { id: number; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function generateStudentToken(payload: { id: number; matricNo: string }): string {
  return jwt.sign({ ...payload, role: 'student' }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { id: number; email?: string; role: string; matricNo?: string } {
  return jwt.verify(token, JWT_SECRET) as { id: number; email?: string; role: string; matricNo?: string };
}
