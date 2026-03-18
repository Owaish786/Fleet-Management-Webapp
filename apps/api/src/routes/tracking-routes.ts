import { Router } from 'express'
import { z } from 'zod'

import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { createTrackingPing, getLatestTracking } from '../services/tracking-service.js'

export const trackingRouter = Router()

const trackingPingSchema = z.object({
  vehicleId: z.string().cuid(),
  driverId: z.string().cuid().optional().nullable(),
  tripId: z.string().cuid().optional().nullable(),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  speedKph: z.number().gte(0).optional().nullable(),
  headingDeg: z.number().gte(0).lte(360).optional().nullable(),
  accuracyM: z.number().gte(0).optional().nullable(),
  batteryLevel: z.number().int().gte(0).lte(100).optional().nullable(),
  recordedAt: z.string().datetime().optional(),
})

trackingRouter.use(requireAuth)

trackingRouter.get('/latest', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    response.json(await getLatestTracking(userId))
  } catch (error) {
    next(error)
  }
})

trackingRouter.post('/ping', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    const payload = trackingPingSchema.parse(request.body)
    const result = await createTrackingPing(
      {
        ...payload,
        recordedAt: payload.recordedAt ? new Date(payload.recordedAt) : undefined,
      },
      userId
    )
    response.status(201).json(result)
  } catch (error) {
    next(error)
  }
})