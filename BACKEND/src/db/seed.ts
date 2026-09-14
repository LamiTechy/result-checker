import { db } from './index.js';
import { admins, students, courses, caResults } from './schema.js';
import { hashPassword } from '../utils/auth.js';

async function seed() {
  console.log('Seeding database...');

  const adminPassword = await hashPassword('admin123');
  const [admin] = await db.insert(admins).values({
    name: 'Super Admin',
    email: 'admin@ife.edu.ng',
    passwordHash: adminPassword,
    role: 'super_admin',
  }).returning();

  const [lecturer] = await db.insert(admins).values({
    name: 'Dr. John Lecturer',
    email: 'lecturer@ife.edu.ng',
    passwordHash: adminPassword,
    role: 'lecturer',
  }).returning();

  const studentData = [
    { fullName: 'Adeyemi Ola', matricNo: 'IFE2020/001', department: 'Computer Science', level: '400', session: '2024/2025' },
    { fullName: 'Chioma Okeke', matricNo: 'IFE2020/002', department: 'Computer Science', level: '400', session: '2024/2025' },
    { fullName: 'Emeka Nwosu', matricNo: 'IFE2020/003', department: 'Computer Science', level: '400', session: '2024/2025' },
    { fullName: 'Funmi Adebayo', matricNo: 'IFE2020/004', department: 'Computer Science', level: '400', session: '2024/2025' },
    { fullName: 'Garba Mohammed', matricNo: 'IFE2020/005', department: 'Computer Science', level: '400', session: '2024/2025' },
  ];

  const createdStudents = [];
  for (const s of studentData) {
    const [student] = await db.insert(students).values(s).returning();
    createdStudents.push(student);
  }

  const courseData = [
    { code: 'CSC401', title: 'Software Engineering', unit: 3, session: '2024/2025', semester: 'first', lecturerId: lecturer.id },
    { code: 'CSC403', title: 'Artificial Intelligence', unit: 3, session: '2024/2025', semester: 'first', lecturerId: lecturer.id },
    { code: 'CSC405', title: 'Computer Networks', unit: 2, session: '2024/2025', semester: 'first', lecturerId: lecturer.id },
  ];

  const createdCourses = [];
  for (const c of courseData) {
    const [course] = await db.insert(courses).values(c).returning();
    createdCourses.push(course);
  }

  for (const student of createdStudents) {
    for (const course of createdCourses) {
      const ts = (Math.random() * 30 + 10).toFixed(2);
      const as = (Math.random() * 30 + 10).toFixed(2);
      const at = (Math.random() * 10 + 5).toFixed(2);
      await db.insert(caResults).values({
        studentId: student.id,
        courseId: course.id,
        testScore: ts,
        assignmentScore: as,
        attendanceScore: at,
        totalScore: (Number(ts) + Number(as) + Number(at)).toFixed(2),
        status: 'published',
        updatedBy: admin.id,
      });
    }
  }

  console.log('Seed complete!');
  console.log(`Admin login: admin@ife.edu.ng / admin123`);
  console.log(`Lecturer login: lecturer@ife.edu.ng / admin123`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
