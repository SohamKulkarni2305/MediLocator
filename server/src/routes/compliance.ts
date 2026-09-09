import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(requireAuth, requireRole(['ADMIN']));

router.get('/kpis', (req, res) => {
  // Mock data for compliance KPIs
  res.json({
    kpis: {
      overallCompliance: 98.4,
      pendingKYC: 12,
      scheduledInspections: 4,
      criticalViolations: 0,
    }
  });
});

router.get('/trends', (req, res) => {
  // For Phase 1, we return static data matching src/data/complianceData.ts
  // In Phase 2, this will be generated from DB aggregations
  const timeLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
  const genericDispensation = [82, 83, 85, 84, 86, 88, 89, 91, 90, 92, 93, 94];
  const auditPassRate = [96, 95, 96, 97, 96, 97, 98, 97, 98, 98, 99, 98.4];
  const priceCeilingCompliance = [99, 99, 100, 99, 100, 100, 100, 100, 100, 100, 100, 100];

  res.json({
    timeLabels,
    datasets: {
      genericDispensation,
      auditPassRate,
      priceCeilingCompliance
    }
  });
});

export default router;
