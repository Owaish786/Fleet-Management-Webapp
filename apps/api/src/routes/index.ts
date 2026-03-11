import { Router } from 'express'

import { authRouter } from './auth-routes.js'
import { dashboardRouter } from './dashboard-routes.js'
import { fleetRouter } from './fleet-routes.js'

export const apiRouter = Router()

apiRouter.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/dashboard', dashboardRouter)
apiRouter.use('/', fleetRouter)