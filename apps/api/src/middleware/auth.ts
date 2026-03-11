import type { NextFunction, Request, Response } from 'express'

import { getUserById, UnauthorizedError, verifyToken } from '../services/auth-service.js'

export interface AuthRequest extends Request {
  user?: { id: string; name: string; email: string; createdAt: Date }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header.'))
  }

  const token = header.slice(7)

  try {
    const payload = verifyToken(token)
    const user = await getUserById(payload.sub)
    if (!user) {
      return next(new UnauthorizedError('User not found.'))
    }
    ;(req as AuthRequest).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }
    next()
  } catch {
    next(new UnauthorizedError('Invalid or expired token.'))
  }
}
