import { Router } from 'express'
import { z } from 'zod'

import { createHttpError } from '../lib/http-error.js'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import {
  listDrivers,
  listMaintenanceRecords,
  listTrips,
  listVehicles,
} from '../services/fleet-service.js'

const indianPlatePattern = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/
const indianLicensePattern = /^[A-Z]{2}-\d{6,14}$/
const indianPhonePattern = /^\+91\s[6-9]\d{4}\s\d{5}$/

function normalizePlateNumber(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function normalizeLicenseNumber(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (compact.length <= 2) {
    return compact
  }

  return `${compact.slice(0, 2)}-${compact.slice(2)}`
}

function normalizeIndianPhone(value: string) {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2)
  }

  if (digits.length !== 10) {
    return value.trim()
  }

  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

const vehicleSchema = z.object({
  plateNumber: z.string().trim().transform(normalizePlateNumber).refine(
    (value) => indianPlatePattern.test(value),
    'Use an Indian registration number like DL01AB2451.',
  ),
  make: z.string().min(2),
  model: z.string().min(1),
  year: z.coerce.number().int().gte(2000).lte(2100),
  mileage: z.coerce.number().int().gte(0),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'IDLE']),
  assignedDriverId: z.string().cuid().optional().nullable(),
})

const driverSchema = z.object({
  name: z.string().min(3),
  licenseNumber: z.string().trim().transform(normalizeLicenseNumber).refine(
    (value) => indianLicensePattern.test(value),
    'Use an Indian licence number like DL-482190.',
  ),
  phone: z.string().trim().transform(normalizeIndianPhone).refine(
    (value) => indianPhonePattern.test(value),
    'Use an Indian phone number like +91 98765 43210.',
  ),
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

const vehicleAssignmentSchema = z.object({
  assignedDriverId: z.string().cuid().nullable(),
  allowReassignment: z.boolean().optional().default(false),
})

const tripCompletionSchema = z.object({
  arrivalAt: z.string().datetime().optional(),
  fuelUsedLiters: z.coerce.number().gte(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  releaseAssignment: z.boolean().optional().default(false),
})

export const fleetRouter = Router()

fleetRouter.use(requireAuth)

fleetRouter.get('/vehicles', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    response.json(await listVehicles(userId))
  } catch (error) {
    next(error)
  }
})

fleetRouter.post('/vehicles', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    const payload = vehicleSchema.parse(request.body)
    const vehicle = await createVehicleRecord(payload, userId)
    response.status(201).json(vehicle)
  } catch (error) {
    next(error)
  }
})

fleetRouter.patch('/vehicles/:vehicleId/assignment', async (request, response, next) => {
  try {
    const payload = vehicleAssignmentSchema.parse(request.body)
    const vehicle = await updateVehicleAssignment(request.params.vehicleId, payload)
    response.json(vehicle)
  } catch (error) {
    next(error)
  }
})

fleetRouter.get('/drivers', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    response.json(await listDrivers(userId))
  } catch (error) {
    next(error)
  }
})

fleetRouter.post('/drivers', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    const payload = driverSchema.parse(request.body)
    const driver = await prisma.driver.create({
      data: { ...payload, ownerId: userId },
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

fleetRouter.get('/trips', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    response.json(await listTrips(userId))
  } catch (error) {
    next(error)
  }
})

fleetRouter.post('/trips', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    const payload = tripSchema.parse(request.body)
    const trip = await createTripRecord(payload, userId)
    response.status(201).json(trip)
  } catch (error) {
    next(error)
  }
})

fleetRouter.patch('/trips/:tripId/complete', async (request, response, next) => {
  try {
    const payload = tripCompletionSchema.parse(request.body)
    const trip = await completeTripRecord(request.params.tripId, payload)
    response.json(trip)
  } catch (error) {
    next(error)
  }
})

fleetRouter.get('/maintenance', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    response.json(await listMaintenanceRecords(userId))
  } catch (error) {
    next(error)
  }
})

fleetRouter.post('/maintenance', async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).user!.id
    const payload = maintenanceSchema.parse(request.body)
    const record = await prisma.maintenanceRecord.create({
      data: {
        ...payload,
        ownerId: userId,
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

async function createVehicleRecord(payload: z.infer<typeof vehicleSchema>, userId: string) {
  return prisma.$transaction(async (tx) => {
    if (payload.assignedDriverId) {
      const [driver, existingAssignment] = await Promise.all([
        tx.driver.findUnique({
          where: { id: payload.assignedDriverId },
          select: { id: true, name: true },
        }),
        tx.vehicle.findFirst({
          where: { assignedDriverId: payload.assignedDriverId },
          select: { id: true, plateNumber: true },
        }),
      ])

      if (!driver) {
        throw createHttpError(404, 'Assigned driver was not found.')
      }

      if (existingAssignment) {
        throw createHttpError(409, `${driver.name} is already assigned to vehicle ${existingAssignment.plateNumber}.`)
      }
    }

    return tx.vehicle.create({
      data: { ...payload, ownerId: userId },
      include: {
        assignedDriver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  })
}

async function createTripRecord(payload: z.infer<typeof tripSchema>, userId: string) {
  return prisma.$transaction(async (tx) => {
    const [vehicle, driver, driverAssignedVehicle, activeVehicleTrip, activeDriverTrip] = await Promise.all([
      tx.vehicle.findUnique({
        where: { id: payload.vehicleId },
        select: {
          id: true,
          plateNumber: true,
          status: true,
          assignedDriverId: true,
        },
      }),
      tx.driver.findUnique({
        where: { id: payload.driverId },
        select: {
          id: true,
          name: true,
          status: true,
        },
      }),
      tx.vehicle.findFirst({
        where: { assignedDriverId: payload.driverId },
        select: { id: true, plateNumber: true },
      }),
      payload.status === 'IN_PROGRESS'
        ? tx.trip.findFirst({
            where: {
              vehicleId: payload.vehicleId,
              status: 'IN_PROGRESS',
            },
            select: { id: true, routeName: true },
          })
        : Promise.resolve(null),
      payload.status === 'IN_PROGRESS'
        ? tx.trip.findFirst({
            where: {
              driverId: payload.driverId,
              status: 'IN_PROGRESS',
            },
            select: { id: true, routeName: true },
          })
        : Promise.resolve(null),
    ])

    if (!vehicle) {
      throw createHttpError(404, 'Selected vehicle was not found.')
    }

    if (!driver) {
      throw createHttpError(404, 'Selected driver was not found.')
    }

    if (vehicle.assignedDriverId && vehicle.assignedDriverId !== driver.id) {
      throw createHttpError(409, `${vehicle.plateNumber} is assigned to another driver.`)
    }

    if (driverAssignedVehicle && driverAssignedVehicle.id !== vehicle.id) {
      throw createHttpError(409, `${driver.name} is already assigned to vehicle ${driverAssignedVehicle.plateNumber}.`)
    }

    if (payload.status === 'IN_PROGRESS') {
      if (vehicle.status === 'MAINTENANCE') {
        throw createHttpError(409, `${vehicle.plateNumber} cannot start a trip while in maintenance.`)
      }

      if (driver.status === 'OFF_DUTY') {
        throw createHttpError(409, `${driver.name} is off duty and cannot start a trip.`)
      }

      if (activeVehicleTrip) {
        throw createHttpError(409, `${vehicle.plateNumber} already has an active trip.`)
      }

      if (activeDriverTrip) {
        throw createHttpError(409, `${driver.name} already has an active trip.`)
      }
    }

    if (!vehicle.assignedDriverId && payload.status !== 'COMPLETED') {
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { assignedDriverId: driver.id },
      })
    }

    if (payload.status === 'IN_PROGRESS') {
      await Promise.all([
        tx.driver.update({
          where: { id: driver.id },
          data: { status: 'ON_ROUTE' },
        }),
        tx.vehicle.update({
          where: { id: vehicle.id },
          data: { status: 'ACTIVE' },
        }),
      ])
    }

    return tx.trip.create({
      data: {
        ...payload,
        ownerId: userId,
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
  })
}

async function updateVehicleAssignment(
  vehicleId: string,
  payload: z.infer<typeof vehicleAssignmentSchema>,
) {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        plateNumber: true,
        assignedDriverId: true,
      },
    })

    if (!vehicle) {
      throw createHttpError(404, 'Selected vehicle was not found.')
    }

    if (vehicle.assignedDriverId === payload.assignedDriverId) {
      return tx.vehicle.findUniqueOrThrow({
        where: { id: vehicle.id },
        include: {
          assignedDriver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    const activeVehicleTrip = await tx.trip.findFirst({
      where: {
        vehicleId: vehicle.id,
        status: 'IN_PROGRESS',
      },
      select: {
        id: true,
        routeName: true,
        driverId: true,
      },
    })

    if (!payload.assignedDriverId) {
      if (activeVehicleTrip) {
        throw createHttpError(409, `${vehicle.plateNumber} cannot be released during an active trip.`)
      }

      return tx.vehicle.update({
        where: { id: vehicle.id },
        data: { assignedDriverId: null },
        include: {
          assignedDriver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    const [driver, driverAssignedVehicle, driverActiveTrip] = await Promise.all([
      tx.driver.findUnique({
        where: { id: payload.assignedDriverId },
        select: {
          id: true,
          name: true,
        },
      }),
      tx.vehicle.findFirst({
        where: { assignedDriverId: payload.assignedDriverId },
        select: {
          id: true,
          plateNumber: true,
        },
      }),
      tx.trip.findFirst({
        where: {
          driverId: payload.assignedDriverId,
          status: 'IN_PROGRESS',
        },
        select: {
          id: true,
          routeName: true,
          vehicleId: true,
        },
      }),
    ])

    if (!driver) {
      throw createHttpError(404, 'Selected driver was not found.')
    }

    if (activeVehicleTrip && activeVehicleTrip.driverId !== driver.id) {
      throw createHttpError(409, `${vehicle.plateNumber} cannot switch drivers during an active trip.`)
    }

    if (driverActiveTrip && driverActiveTrip.vehicleId !== vehicle.id) {
      throw createHttpError(409, `${driver.name} is already on an active trip.`)
    }

    if (driverAssignedVehicle && driverAssignedVehicle.id !== vehicle.id) {
      if (!payload.allowReassignment) {
        throw createHttpError(409, `${driver.name} is already assigned to vehicle ${driverAssignedVehicle.plateNumber}.`)
      }

      const sourceVehicleActiveTrip = await tx.trip.findFirst({
        where: {
          vehicleId: driverAssignedVehicle.id,
          status: 'IN_PROGRESS',
        },
        select: { id: true },
      })

      if (sourceVehicleActiveTrip) {
        throw createHttpError(409, `${driverAssignedVehicle.plateNumber} has an active trip and cannot release its driver.`)
      }

      await tx.vehicle.update({
        where: { id: driverAssignedVehicle.id },
        data: { assignedDriverId: null },
      })
    }

    return tx.vehicle.update({
      where: { id: vehicle.id },
      data: { assignedDriverId: driver.id },
      include: {
        assignedDriver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  })
}

async function completeTripRecord(
  tripId: string,
  payload: z.infer<typeof tripCompletionSchema>,
) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        status: true,
        vehicleId: true,
        driverId: true,
      },
    })

    if (!trip) {
      throw createHttpError(404, 'Selected trip was not found.')
    }

    if (trip.status === 'COMPLETED') {
      return tx.trip.findUniqueOrThrow({
        where: { id: trip.id },
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
    }

    if (trip.status !== 'IN_PROGRESS') {
      throw createHttpError(409, 'Only in-progress trips can be completed from the dispatch board.')
    }

    const vehicle = await tx.vehicle.findUnique({
      where: { id: trip.vehicleId },
      select: {
        id: true,
        assignedDriverId: true,
      },
    })

    await tx.trip.update({
      where: { id: trip.id },
      data: {
        status: 'COMPLETED',
        arrivalAt: payload.arrivalAt ? new Date(payload.arrivalAt) : new Date(),
        fuelUsedLiters: payload.fuelUsedLiters ?? undefined,
        notes: payload.notes ?? undefined,
      },
    })

    await Promise.all([
      tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      }),
      tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: 'IDLE',
          assignedDriverId: payload.releaseAssignment && vehicle?.assignedDriverId === trip.driverId ? null : undefined,
        },
      }),
    ])

    return tx.trip.findUniqueOrThrow({
      where: { id: trip.id },
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
  })
}