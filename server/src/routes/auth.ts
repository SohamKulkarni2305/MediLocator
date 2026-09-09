import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken } from '../services/authService';
import { validateRequest } from '../middleware/validate';
import { LoginSchema, RefreshTokenSchema } from '../lib/zod-schemas';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', validateRequest(LoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', validateRequest(RefreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await prisma.refreshSession.deleteMany({ where: { token: refreshToken } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, abhaId: true, phone: true, mrn: true },
    });
    
    if (!user) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
