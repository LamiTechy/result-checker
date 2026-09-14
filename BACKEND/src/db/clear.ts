import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function clear() {
  await sql`TRUNCATE TABLE ca_results, audit_log, courses, students, admins RESTART IDENTITY CASCADE`;
  console.log('Tables cleared');
  process.exit(0);
}

clear().catch((err) => { console.error(err); process.exit(1); });
