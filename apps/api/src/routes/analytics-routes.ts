import { Router } from 'express'
import { z } from 'zod'

import { env } from '../config/env.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { getAnalyticsInsightsFromLambda } from '../services/aws-analytics-lambda-service.js'
import { uploadAnalyticsSnapshotToS3 } from '../services/analytics-export-service.js'
import { getFleetAnalyticsInsights } from '../services/analytics-service.js'
import { uploadAccessLogsToS3 } from '../services/log-export-service.js'
import { getSchedulerStatus } from '../services/export-scheduler-service.js'

export const analyticsRouter = Router()

const exportSchema = z.object({
  keyPrefix: z.string().min(1).max(80).optional(),
})

const logsExportSchema = z.object({
  keyPrefix: z.string().min(1).max(80).optional(),
})

analyticsRouter.use(requireAuth)

analyticsRouter.get('/insights', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    const insights = env.AWS_LAMBDA_ANALYTICS_FUNCTION
      ? await getAnalyticsInsightsFromLambda()
      : await getFleetAnalyticsInsights(userId)
    response.json(insights)
  } catch (error) {
    next(error)
  }
})

analyticsRouter.post('/insights/export-s3', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    const payload = exportSchema.parse(request.body)
    const insights = await getFleetAnalyticsInsights(userId)
    const result = await uploadAnalyticsSnapshotToS3(insights, payload.keyPrefix)

    response.status(201).json({
      message: 'Analytics snapshot uploaded to S3.',
      ...result,
      generatedAt: insights.generatedAt,
    })
  } catch (error) {
    next(error)
  }
})

analyticsRouter.post('/logs/export-s3', async (request, response, next) => {
  try {
    const payload = logsExportSchema.parse(request.body)
    const result = await uploadAccessLogsToS3(payload.keyPrefix)
    response.status(201).json({
      message: 'Access logs uploaded to S3.',
      ...result,
    })
  } catch (error) {
    next(error)
  }
})

analyticsRouter.get('/export-scheduler/status', async (_request, response) => {
  const status = getSchedulerStatus()
  response.json({
    message: 'Periodic export scheduler status',
    scheduler: status,
  })
})
