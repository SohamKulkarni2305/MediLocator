import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { createAuditLog } from '../services/auditService';

const router = Router();

// Apply auth and admin role to all routes in this file
router.use(requireAuth, requireRole(['ADMIN']));

router.get('/', async (req, res, next) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      include: { documents: true },
      orderBy: { submittedAt: 'desc' },
    });
    res.json(pharmacies);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: req.params.id },
      include: { documents: true, auditLogs: { orderBy: { timestamp: 'desc' } } },
    });
    if (!pharmacy) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Pharmacy not found' } });
    res.json(pharmacy);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/approve', async (req, res, next) => {
  try {
    const pharmacy = await prisma.pharmacy.update({
      where: { id: req.params.id },
      data: { status: 'approved' },
    });

    await createAuditLog(
      pharmacy.id,
      'APPROVED',
      'Pharmacy KYC Approved',
      `Manual verification completed by ${req.user!.email}`,
      [
        { label: 'License verified', value: pharmacy.licenseNumber },
        { label: 'Action by', value: req.user!.email }
      ]
    );

    res.json(pharmacy);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/reject', async (req, res, next) => {
  try {
    const pharmacy = await prisma.pharmacy.update({
      where: { id: req.params.id },
      data: { status: 'rejected' },
    });

    await createAuditLog(
      pharmacy.id,
      'BLOCKED',
      'Pharmacy KYC Rejected',
      `Application rejected by ${req.user!.email}`,
      [
        { label: 'Reason', value: req.body.reason || 'Not specified', isWarning: true },
        { label: 'Action by', value: req.user!.email }
      ]
    );

    res.json(pharmacy);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/flag-inspection', async (req, res, next) => {
  try {
    const pharmacy = await prisma.pharmacy.update({
      where: { id: req.params.id },
      data: { status: 'inspection_pending' },
    });

    await createAuditLog(
      pharmacy.id,
      'AUDIT',
      'Flagged for Inspection',
      `Physical inspection requested by ${req.user!.email}`,
      [
        { label: 'Notes', value: req.body.notes || 'Routine check', isWarning: true }
      ]
    );

    res.json(pharmacy);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/audit-log', async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { pharmacyId: req.params.id },
      orderBy: { timestamp: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;
