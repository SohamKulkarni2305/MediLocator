import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AuditLogType } from '@prisma/client';

export const createAuditLog = async (
  pharmacyId: string,
  type: AuditLogType,
  title: string,
  description: string,
  details: { label: string; value: string; isHighlight?: boolean; isWarning?: boolean }[]
) => {
  // Generate a cryptographic hash for the audit entry
  const dataString = JSON.stringify({ pharmacyId, type, title, description, details, timestamp: new Date().toISOString() });
  const signature = crypto.createHash('sha256').update(dataString).digest('hex');

  const log = await prisma.auditLog.create({
    data: {
      pharmacyId,
      type,
      title,
      description,
      details,
      signature: `0x${signature.substring(0, 32)}`, // Store a shortened version for display
    },
  });

  return log;
};
