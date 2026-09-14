import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { caResults, students, courses, auditLog } from '../db/schema.js';
import { AuthRequest, requireAdmin } from '../middleware/auth.js';
import { audit } from '../utils/audit.js';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

router.get('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  const all = await db.select().from(caResults).orderBy(desc(caResults.updatedAt));
  res.json(all);
});

router.get('/course/:courseId', requireAdmin, async (req: AuthRequest, res: Response) => {
  const results = await db.select().from(caResults).where(eq(caResults.courseId, Number(req.params.courseId)));
  res.json(results);
});

router.get('/student/:studentId', requireAdmin, async (req: AuthRequest, res: Response) => {
  const results = await db.select().from(caResults).where(eq(caResults.studentId, Number(req.params.studentId)));
  res.json(results);
});

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, courseId, testScore, assignmentScore, attendanceScore, status } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ error: 'studentId and courseId required' });
    }
    const totalScore = (Number(testScore || 0) + Number(assignmentScore || 0) + Number(attendanceScore || 0)).toFixed(2);
    const [result] = await db.insert(caResults).values({
      studentId, courseId, testScore, assignmentScore, attendanceScore,
      totalScore, status: status || 'draft', updatedBy: req.admin!.id,
    }).returning();
    await audit(req.admin!.id, 'CREATE', 'ca_results', result.id, `Created result for student ${studentId} course ${courseId}`);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create result' });
  }
});

router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { testScore, assignmentScore, attendanceScore, status } = req.body;
    const totalScore = (Number(testScore || 0) + Number(assignmentScore || 0) + Number(attendanceScore || 0)).toFixed(2);
    const [updated] = await db.update(caResults).set({
      testScore, assignmentScore, attendanceScore, totalScore, status,
      updatedBy: req.admin!.id, updatedAt: new Date(),
    }).where(eq(caResults.id, id)).returning();
    if (!updated) return res.status(404).json({ error: 'Result not found' });
    await audit(req.admin!.id, 'UPDATE', 'ca_results', id, `Updated result to test:${testScore}, assign:${assignmentScore}, attend:${attendanceScore}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update result' });
  }
});

router.post('/bulk', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, entries } = req.body;
    if (!courseId || !entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'courseId and entries array required' });
    }
    const created = [];
    for (const entry of entries) {
      const student = await db.select().from(students).where(eq(students.matricNo, entry.matricNo));
      if (student.length === 0) continue;
      const totalScore = (Number(entry.testScore || 0) + Number(entry.assignmentScore || 0) + Number(entry.attendanceScore || 0)).toFixed(2);
      const [result] = await db.insert(caResults).values({
        studentId: student[0].id, courseId, testScore: entry.testScore,
        assignmentScore: entry.assignmentScore, attendanceScore: entry.attendanceScore,
        totalScore, status: 'draft', updatedBy: req.admin!.id,
      }).returning();
      created.push(result);
    }
    await audit(req.admin!.id, 'BULK_CREATE', 'ca_results', courseId, `Bulk created ${created.length} results for course ${courseId}`);
    res.status(201).json({ count: created.length, results: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk create results' });
  }
});

router.post('/publish/course/:courseId', requireAdmin, async (req: AuthRequest, res: Response) => {
  const courseId = Number(req.params.courseId);
  const updated = await db.update(caResults).set({ status: 'published', updatedBy: req.admin!.id, updatedAt: new Date() })
    .where(and(eq(caResults.courseId, courseId), eq(caResults.status, 'draft'))).returning();
  await audit(req.admin!.id, 'PUBLISH', 'ca_results', courseId, `Published ${updated.length} results for course ${courseId}`);
  res.json({ count: updated.length });
});

router.get('/audit-log', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const logs = await db.select().from(auditLog).orderBy(desc(auditLog.timestamp)).limit(100);
  res.json(logs);
});

export default router;
