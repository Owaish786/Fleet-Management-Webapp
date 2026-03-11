import { Router } from 'express'
import { z } from 'zod'

import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import {
  listDrivers,
  listMaintenanceRecords,
  listTrips,
  listVehicles,
} from '../services/fleet-service.js'

const vehicleSchema = z.object({
  plateNumber: z.string().min(3),
  make: z.string().min(2),
  model: z.string().min(1),
  year: z.coerce.number().int().gte(2000).lte(2100),
  mileage: z.coerce.number().int().gte(0),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'IDLE']),
  assignedDriverId: z.string().cuid().optional().nullable(),
})

const driverSchema = z.object({
  name: z.string().min(3),
  licenseNumber: z.string().min(5),
  phone: z.string().min(8),
  status: z.enum(['AVAILABLE', 'ON_ROUTE', 'OFF_DUTY']),
})

const tripSchema = z.object({
  routeName: z.string().min(3),
  origin: z.string().min(2),
  destination: z.string().min(2),
  departureAt: z.string().datetime(),
  arrivalAt: z.string().datetime().optional().nullable(),
  distanceKm: z.coerce.number().int().gt(0),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']),
  fuelUsedLiters: z.coerce.number().gte(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  vehicleId: z.string().cuid(),
  driverId: z.string().cuid(),
})

const maintenanceSchema = z.object({
  type: z.string().min(3),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']),
  scheduledFor: z.string().datetime(),
  completedAt: z.string().datetime().optional().nullable(),
  cost: z.coerce.number().gte(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  vehicleId: z.string().cuid(),
})

export const fleetRouter = Router()

fleetRouter.use(requireAuth)

fleetRouter.get('/vehicles', async (_request, response, next) => {
  try {
    response.json(await listVehicles())
  } catch (error) {
    next(error)
  }
})

fleetRouter.post('/vehicles', async (request, response, next) => {
  try {
    const payload = vehicleSchema.parse(request.body)
    const vehicle = await prisma.vehicle.create({
      data: payload,
      include: {
        assignedDriver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    response.status(201).json(vehicle)
  } catch (error) {
    next(error)
  }
})

fleetRouter.get('/drivers', async (_request, response, next) => {
  try {
    response.json(await listDrivers())
  } catch (error) {
    next(error)
  }
})

fleetRouter.post('/drivers', async (request, response, next) => {
  try {
    const payload = driverSchema.parse(request.body)
    const driver = await prisma.driver.create({
      data: payload,
      include: {
        assignedVehicles: {
          select: {
            id: true,
            plateNumber: true,
          },
        },
      },
    })
    response.status(201).json(driver)
  } catch (error) {
    next(error)
  }
})

fleetRouter.get('/trips', async (_request, response, next) => {
  try {
    response.json(await listTrips())
  } catch (error) {
    next(error)
  }
})

fleetRouter.post('/trips', async (request, response, next) => {
  try {
    const payload = tripSchema.parse(request.body)
    const trip = await prisma.trip.create({
      data: {
        ...payload,
        departureAt: new Date(payload.departureAt),
        arrivalAt: payload.arrivalAt ? new Date(payload.arrivalAt) : null,
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
          },
        },
      },
    })
    response.status(201).json(trip)
  } catch (error) {
    next(error)
  }
})

fleetRouter.get('/maintenance', async (_request, response, next) => {
  try {
    response.json(await listMaintenanceRecords())
  } catch (error) {
    next(error)
  }
})

fleetRouter.post('/maintenance', async (request, response, next) => {
  try {
    const payload = maintenanceSchema.parse(request.body)
    const record = await prisma.maintenanceRecord.create({
      data: {
        ...payload,
        scheduledFor: new Date(payload.scheduledFor),
        completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
          },
        },
      },
    })
    response.status(201).json({
      ...record,
      cost: record.cost ? Number(record.cost) : null,
    })
  } catch (error) {
    next(error)
  }
})