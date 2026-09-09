import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(requireAuth, requireRole(['CUSTOMER', 'ADMIN']));

router.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { 
        id: req.params.id,
        patientId: req.user!.role === 'CUSTOMER' ? req.user!.id : undefined 
      },
      include: { milestones: { orderBy: { sortOrder: 'asc' } }, pharmacy: true },
    });
    
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/milestones', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { 
        id: req.params.id,
        patientId: req.user!.role === 'CUSTOMER' ? req.user!.id : undefined 
      },
      select: { milestones: { orderBy: { sortOrder: 'asc' } } },
    });
    
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    res.json(order.milestones);
  } catch (error) {
    next(error);
  }
});

export default router;
