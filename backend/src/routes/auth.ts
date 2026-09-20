import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken, verifyToken } from '../services/authService';
import { validateRequest } from '../middleware/validate';
import { LoginSchema, RefreshTokenSchema, RegisterSchema } from '../lib/zod-schemas';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', validateRequest(RegisterSchema), async (req, res, next) => {
  try {
    const { name, email, password, role, phone, abhaId } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists. Please sign in.' } });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role,
        phone: phone || undefined,
        abhaId: abhaId || undefined,
      },
    });
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await prisma.refreshSession.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, abhaId: user.abhaId, phone: user.phone, mrn: user.mrn },
    });
  } catch (error) {
    next(error);
  }
});

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

    res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, abhaId: user.abhaId, phone: user.phone, mrn: user.mrn } });
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

router.post('/refresh', validateRequest(RefreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const session = await prisma.refreshSession.findUnique({ where: { token: refreshToken } });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Refresh session expired' } });
    }
    const payload = verifyToken(refreshToken, 'refresh');
    const accessToken = signAccessToken({ userId: payload.userId, email: payload.email, role: payload.role });
    res.json({ accessToken, refreshToken });
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

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'abhaId'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const user = await prisma.user.update({ where: { id: req.user!.id }, data, select: { id: true, name: true, email: true, role: true, abhaId: true, phone: true, mrn: true } });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
