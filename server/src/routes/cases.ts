import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validate';
import { CaseSignoffSchema } from '../lib/zod-schemas';

const router = Router();

router.use(requireAuth, requireRole(['PHARMACIST', 'ADMIN']));

router.get('/', async (req, res, next) => {
  try {
    const cases = await prisma.pharmacistCase.findMany({
      include: { lineItems: true, molecules: true },
      orderBy: { slaRemainingSeconds: 'asc' },
    });
    res.json(cases);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const caseData = await prisma.pharmacistCase.findUnique({
      where: { id: req.params.id },
      include: { lineItems: true, molecules: true, prescription: true },
    });
    if (!caseData) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Case not found' } });
    res.json(caseData);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/signoff', validateRequest(CaseSignoffSchema), async (req, res, next) => {
  try {
    const { approved, rejectionReason, pharmacistName, pharmacistLicense } = req.body;

    const targetCase = await prisma.pharmacistCase.findUnique({ where: { id: req.params.id } });
    if (!targetCase) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Case not found' } });

    const nowFormatted = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Case
      const updatedCase = await tx.pharmacistCase.update({
        where: { id: req.params.id },
        data: {
          status: 'Active',
          pharmacistId: req.user!.id,
        },
      });

      // 2. Update Prescription
      await tx.prescription.update({
        where: { id: targetCase.prescriptionId },
        data: {
          status: approved ? 'approved' : 'rejected',
          statusLabel: approved ? 'Verified & Active' : 'Verification Rejected',
          statusDescription: approved 
            ? `Approved by ${pharmacistName} (${dateFormatted}, ${nowFormatted}). Generic substitutions active.`
            : `Rejected during clinical audit: ${rejectionReason}. Please re-upload a clear prescription.`,
          pharmacistId: req.user!.id,
          validUntil: approved ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Rejected',
          daysRemaining: approved ? 90 : 0,
          rejectionReason: approved ? null : rejectionReason,
        },
      });

      // 3. Upsert Signoff
      await tx.pharmacistSignoff.upsert({
        where: { prescriptionId: targetCase.prescriptionId },
        create: {
          prescriptionId: targetCase.prescriptionId,
          name: pharmacistName,
          license: pharmacistLicense,
          timestamp: `${dateFormatted}, ${nowFormatted} IST`,
        },
        update: {
          name: pharmacistName,
          license: pharmacistLicense,
          timestamp: `${dateFormatted}, ${nowFormatted} IST`,
        }
      });

      return updatedCase;
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
