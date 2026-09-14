import { db } from '../db/index.js';
import { auditLog } from '../db/schema.js';

export async function audit(adminId: number, action: string, tableName: string, recordId?: number, details?: string) {
  await db.insert(auditLog).values({ adminId, action, tableName, recordId, details });
}
