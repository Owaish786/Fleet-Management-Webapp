import { Router } from 'express'

import { requireAuth } from '../middleware/auth.js'
import { getDashboardSummary } from '../services/dashboard-service.js'

export const dashboardRouter = Router()

dashboardRouter.use(requireAuth)

dashboardRouter.get('/', async (_request, response, next) => {
  try {
    const summary = await getDashboardSummary()
    response.json(summary)
  } catch (error) {
    next(error)
  }
})