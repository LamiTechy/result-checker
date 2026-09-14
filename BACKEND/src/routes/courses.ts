import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { courses } from '../db/schema.js';
import { AuthRequest, requireAdmin } from '../middleware/auth.js';
import { audit } from '../utils/audit.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const all = await db.select().from(courses).orderBy(courses.code);
  res.json(all);
});

router.get('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const [course] = await db.select().from(courses).where(eq(courses.id, Number(req.params.id)));
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { code, title, unit, session, semester, lecturerId } = req.body;
    if (!code || !title || !unit || !session || !semester) {
      return res.status(400).json({ error: 'Code, title, unit, session, semester required' });
    }
    const existing = await db.select().from(courses).where(eq(courses.code, code));
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Course code already exists' });
    }
    const [course] = await db.insert(courses).values({ code, title, unit, session, semester, lecturerId }).returning();
    await audit(req.admin!.id, 'CREATE', 'courses', course.id, `Created course ${code} - ${title}`);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { code, title, unit, session, semester, lecturerId } = req.body;
    const [updated] = await db.update(courses).set({ code, title, unit, session, semester, lecturerId }).where(eq(courses.id, id)).returning();
    if (!updated) return res.status(404).json({ error: 'Course not found' });
    await audit(req.admin!.id, 'UPDATE', 'courses', id, `Updated course ${code}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(courses).where(eq(courses.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: 'Course not found' });
  await audit(req.admin!.id, 'DELETE', 'courses', id, `Deleted course ${deleted.code}`);
  res.json({ message: 'Course deleted' });
});

export default router;
