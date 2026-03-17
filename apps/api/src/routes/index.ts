import { Router } from 'express'

import { checkAWSConnection } from '../services/health-service.js'
import { analyticsRouter } from './analytics-routes.js'
import { authRouter } from './auth-routes.js'
import { dashboardRouter } from './dashboard-routes.js'
import { fleetRouter } from './fleet-routes.js'
import { trackingRouter } from './tracking-routes.js'

export const apiRouter = Router()

apiRouter.get('/health', async (_request, response) => {
  const aws = await checkAWSConnection()
  response.json({ status: 'ok', aws })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/analytics', analyticsRouter)
apiRouter.use('/dashboard', dashboardRouter)
apiRouter.use('/tracking', trackingRouter)
apiRouter.use('/', fleetRouter)