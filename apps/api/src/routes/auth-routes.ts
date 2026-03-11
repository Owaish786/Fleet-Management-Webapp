import { Router } from 'express'
import { z } from 'zod'

import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { loginUser, registerUser, requestPasswordReset } from '../services/auth-service.js'

export const authRouter = Router()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

authRouter.post('/register', async (request, response, next) => {
  try {
    const { name, email, password } = registerSchema.parse(request.body)
    const result = await registerUser(name, email, password)
    response.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', async (request, response, next) => {
  try {
    const { email, password } = loginSchema.parse(request.body)
    const result = await loginUser(email, password)
    response.json(result)
  } catch (error) {
    next(error)
  }
})

authRouter.post('/forgot-password', async (request, response, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(request.body)
    const result = await requestPasswordReset(email)
    response.json(result)
  } catch (error) {
    next(error)
  }
})

authRouter.get('/me', requireAuth, (request, response) => {
  const { user } = request as AuthRequest
  response.json({ user })
})
