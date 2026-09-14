import { pgTable, serial, varchar, integer, decimal, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['super_admin', 'lecturer']);
export const resultStatusEnum = pgEnum('result_status', ['draft', 'published']);

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('lecturer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  matricNo: varchar('matric_no', { length: 50 }).notNull().unique(),
  department: varchar('department', { length: 255 }).notNull(),
  level: varchar('level', { length: 20 }).notNull(),
  session: varchar('session', { length: 20 }).notNull(),
  pinHash: varchar('pin_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  unit: integer('unit').notNull(),
  session: varchar('session', { length: 20 }).notNull(),
  semester: varchar('semester', { length: 20 }).notNull(),
  lecturerId: integer('lecturer_id').references(() => admins.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const caResults = pgTable('ca_results', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  testScore: decimal('test_score', { precision: 5, scale: 2 }),
  assignmentScore: decimal('assignment_score', { precision: 5, scale: 2 }),
  attendanceScore: decimal('attendance_score', { precision: 5, scale: 2 }),
  totalScore: decimal('total_score', { precision: 5, scale: 2 }),
  status: resultStatusEnum('status').notNull().default('draft'),
  updatedBy: integer('updated_by').references(() => admins.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').references(() => admins.id).notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  tableName: varchar('table_name', { length: 255 }).notNull(),
  recordId: integer('record_id'),
  details: text('details'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
