import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validate';
import { RejectPrescriptionSchema, ApprovePrescriptionSchema } from '../lib/zod-schemas';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Customer: List own prescriptions
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: req.user!.id },
      include: { medicines: true, pharmacistSignoff: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
});

// Customer: Upload new prescription
router.post('/', requireAuth, requireRole(['CUSTOMER']), upload.single('file'), async (req, res, next) => {
  try {
    // In a real app, upload file to S3/GCS here and get URL
    const file = req.file;
    if (!file && req.body.source !== 'abha_sync') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'File is required unless syncing via ABHA' } });
    }

    const prescription = await prisma.prescription.create({
      data: {
        rxNumber: `RX-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        patientId: req.user!.id,
        fileName: file ? file.originalname : 'abha_sync_doc.pdf',
        fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
        source: req.body.source || 'file',
        sourceLabel: req.body.source === 'camera' ? 'Camera Capture' : req.body.source === 'abha_sync' ? 'ABHA Sync' : 'Device Document',
        uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        uploadTimestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST',
        doctorName: req.body.doctorName || 'Unknown Doctor',
        doctorSpecialty: 'General Practice',
        doctorReg: 'Unknown Registration',
        clinicName: req.body.clinicName || 'Unknown Clinic',
        clinicLocation: 'Unknown Location',
        auditHash: '0x' + Math.random().toString(16).slice(2, 34), // Mock hash
      },
    });

    res.status(201).json(prescription);
  } catch (error) {
    next(error);
  }
});

// Customer: Get single prescription
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const prescription = await prisma.prescription.findFirst({
      where: { id: req.params.id, patientId: req.user!.role === 'CUSTOMER' ? req.user!.id : undefined },
      include: { medicines: true, pharmacistSignoff: true, pharmacistCase: true },
    });
    if (!prescription) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Prescription not found' } });
    res.json(prescription);
  } catch (error) {
    next(error);
  }
});

// Pharmacist: Approve prescription
router.put('/:id/approve', requireAuth, requireRole(['PHARMACIST', 'ADMIN']), validateRequest(ApprovePrescriptionSchema), async (req, res, next) => {
  try {
    const { pharmacistName, pharmacistLicense } = req.body;
    
    const nowFormatted = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const result = await prisma.$transaction(async (tx) => {
      const rx = await tx.prescription.update({
        where: { id: req.params.id },
        data: {
          status: 'approved',
          statusLabel: 'Verified & Active',
          statusDescription: `Approved by ${pharmacistName} (${dateFormatted}, ${nowFormatted}). Generic substitutions active.`,
          pharmacistId: req.user!.id,
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          daysRemaining: 90,
          rejectionReason: null,
        },
      });

      await tx.pharmacistSignoff.upsert({
        where: { prescriptionId: req.params.id },
        create: {
          prescriptionId: req.params.id,
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

      // Update associated case if exists
      await tx.pharmacistCase.updateMany({
        where: { prescriptionId: req.params.id },
        data: { status: 'Active' },
      });

      return rx;
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Pharmacist: Reject prescription
router.put('/:id/reject', requireAuth, requireRole(['PHARMACIST', 'ADMIN']), validateRequest(RejectPrescriptionSchema), async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const rx = await prisma.prescription.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        statusLabel: 'Verification Rejected',
        statusDescription: `Rejected during clinical audit: ${reason}. Please re-upload a clear prescription.`,
        pharmacistId: req.user!.id,
        validUntil: 'Rejected',
        daysRemaining: 0,
        rejectionReason: reason,
      },
    });

    res.json(rx);
  } catch (error) {
    next(error);
  }
});

// Customer: Delete (soft delete equivalent)
router.delete('/:id', requireAuth, requireRole(['CUSTOMER']), async (req, res, next) => {
    try {
        await prisma.prescription.deleteMany({
            where: { id: req.params.id, patientId: req.user!.id }
        });
        res.json({ success: true });
    } catch(error) {
        next(error);
    }
});

export default router;
