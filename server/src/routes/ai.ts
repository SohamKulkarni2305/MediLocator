import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { DrugMatchSchema } from '../lib/zod-schemas';
import { extractPrescriptionData, matchDrugs } from '../services/geminiService';

const router = Router();

router.post('/ocr', requireAuth, async (req, res, next) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'imageBase64 and mimeType are required' } });
    }

    const data = await extractPrescriptionData(imageBase64, mimeType);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/match-drugs', requireAuth, validateRequest(DrugMatchSchema), async (req, res, next) => {
  try {
    const { molecules } = req.body;
    const matches = await matchDrugs(molecules);
    res.json(matches);
  } catch (error) {
    next(error);
  }
});

export default router;
