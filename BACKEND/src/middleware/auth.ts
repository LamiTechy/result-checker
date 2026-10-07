import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';

export interface AuthRequest extends Request {
  admin?: { id: number; email: string; role: string };
  student?: { id: number; matricNo?: string };
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = verifyToken(header.slice(7));
    if (payload.role === 'student') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.admin = { id: payload.id, email: payload.email || '', role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireStudent(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please sign in to continue' });
  }
  try {
    const payload = verifyToken(header.slice(7));
    if (payload.role !== 'student') {
      return res.status(403).json({ error: 'Student account required' });
    }
    req.student = { id: payload.id, matricNo: payload.matricNo };
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please sign in again' });
  }
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAdmin(req, res, () => {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: super admin only' });
    }
    next();
  });
}
