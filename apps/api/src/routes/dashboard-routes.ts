import { Router } from 'express'

import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { getDashboardSummary } from '../services/dashboard-service.js'

export const dashboardRouter = Router()

dashboardRouter.use(requireAuth)

dashboardRouter.get('/', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    const summary = await getDashboardSummary(userId)
    response.json(summary)
  } catch (error) {
    next(error)
  }
})