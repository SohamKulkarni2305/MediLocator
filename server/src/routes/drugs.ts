import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { validateRequest } from '../middleware/validate';
import { DrugSearchSchema } from '../lib/zod-schemas';

const router = Router();

router.get('/', validateRequest(DrugSearchSchema, 'query'), async (req, res, next) => {
  try {
    const { q, inStock, limit, offset } = req.query as any;

    const where: any = {};
    if (q) {
      where.OR = [
        { brandName: { contains: q, mode: 'insensitive' } },
        { genericName: { contains: q, mode: 'insensitive' } },
        { saltName: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (inStock !== undefined) {
      where.inStock = inStock;
    }

    const drugs = await prisma.drug.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { savingsPercentage: 'desc' },
    });

    const total = await prisma.drug.count({ where });

    res.json({ data: drugs, pagination: { total, limit, offset } });
  } catch (error) {
    next(error);
  }
});

router.get('/orange-book', async (req, res, next) => {
  try {
    const entries = await prisma.orangeBookEntry.findMany({
      orderBy: { savingsPercent: 'desc' },
    });
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const drug = await prisma.drug.findUnique({ where: { id: req.params.id } });
    if (!drug) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Drug not found' } });
    }
    res.json(drug);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/generics', async (req, res, next) => {
  try {
    const drug = await prisma.drug.findUnique({ where: { id: req.params.id } });
    if (!drug) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Drug not found' } });
    }

    const generics = await prisma.drug.findMany({
      where: {
        saltName: drug.saltName,
        isBrand: false,
        id: { not: drug.id },
      },
      orderBy: { priceInr: 'asc' },
    });

    res.json(generics);
  } catch (error) {
    next(error);
  }
});

export default router;
