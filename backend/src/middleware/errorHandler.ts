import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler]', err);

  const isDatabaseError = typeof err?.name === 'string' && (
    err.name.includes('Prisma') || err.name.includes('Mongo')
  );
  if (isDatabaseError) {
    return res.status(503).json({
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'The service is temporarily unable to reach its database. Please try again shortly.',
      },
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
};
