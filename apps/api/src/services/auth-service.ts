import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'
import { prisma } from '../lib/prisma.js'

const SALT_ROUNDS = 12

export async function registerUser(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ConflictError('A user with this email already exists.')
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  const token = signToken(user.id)
  return { user, token }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new UnauthorizedError('Invalid email or password.')
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password.')
  }

  const token = signToken(user.id)
  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token,
  }
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  })
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  return {
    ok: true,
    message: user
      ? 'Reset instructions would be sent to your email in a production setup.'
      : 'If an account exists for this email, reset instructions would be sent.',
  }
}

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { sub: string } {
  return jwt.verify(token, env.JWT_SECRET) as { sub: string }
}

// ── Custom error classes ──
export class ConflictError extends Error {
  status = 409
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

export class UnauthorizedError extends Error {
  status = 401
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}
