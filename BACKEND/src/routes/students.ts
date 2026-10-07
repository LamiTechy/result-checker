import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { students, caResults, courses } from '../db/schema.js';
import { AuthRequest, requireAdmin, requireStudent } from '../middleware/auth.js';
import { audit } from '../utils/audit.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const all = await db.select().from(students).orderBy(students.matricNo);
  res.json(all);
});

router.get('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const [student] = await db.select().from(students).where(eq(students.id, Number(req.params.id)));
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, matricNo, department, level, session } = req.body;
    if (!fullName || !matricNo || !department || !level || !session) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const existing = await db.select().from(students).where(eq(students.matricNo, matricNo));
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Matric number already exists' });
    }
    const [student] = await db.insert(students).values({ fullName, matricNo, department, level, session }).returning();
    await audit(req.admin!.id, 'CREATE', 'students', student.id, `Created student ${fullName} (${matricNo})`);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { fullName, matricNo, department, level, session } = req.body;
    const [updated] = await db.update(students).set({ fullName, matricNo, department, level, session }).where(eq(students.id, id)).returning();
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    await audit(req.admin!.id, 'UPDATE', 'students', id, `Updated student ${fullName}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(students).where(eq(students.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: 'Student not found' });
  await audit(req.admin!.id, 'DELETE', 'students', id, `Deleted student ${deleted.fullName}`);
  res.json({ message: 'Student deleted' });
});

router.post('/verify', requireStudent, async (req: AuthRequest, res: Response) => {
  const { matricNo, surname } = req.body;
  if (!matricNo || !surname) {
    return res.status(400).json({ error: 'Matric number and surname required' });
  }
  const [student] = await db.select().from(students).where(eq(students.matricNo, matricNo));
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (student.id !== req.student!.id) {
    return res.status(403).json({ error: 'You can only view your own results' });
  }
  const surnameLower = student.fullName.toLowerCase().split(' ')[0];
  if (surname.toLowerCase() !== surnameLower) {
    return res.status(403).json({ error: 'Surname does not match' });
  }
  const results = await db.select({
    courseCode: courses.code,
    courseTitle: courses.title,
    unit: courses.unit,
    testScore: caResults.testScore,
    assignmentScore: caResults.assignmentScore,
    attendanceScore: caResults.attendanceScore,
    totalScore: caResults.totalScore,
    status: caResults.status,
  }).from(caResults).innerJoin(courses, eq(caResults.courseId, courses.id)).where(
    and(eq(caResults.studentId, student.id), eq(caResults.status, 'published'))
  );
  res.json({ student: { ...student, pinHash: undefined }, results });
});

export default router;
