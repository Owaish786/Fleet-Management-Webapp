import { prisma } from '../lib/prisma.js'
import { createHttpError } from '../lib/http-error.js'
import { broadcastTrackingUpdate, type TrackingBroadcastPayload } from '../lib/socket.js'

export interface CreateTrackingPingInput {
  vehicleId: string
  driverId?: string | null
  tripId?: string | null
  latitude: number
  longitude: number
  speedKph?: number | null
  headingDeg?: number | null
  accuracyM?: number | null
  batteryLevel?: number | null
  recordedAt?: Date
}

export async function createTrackingPing(input: CreateTrackingPingInput) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: input.vehicleId },
    select: {
      id: true,
      plateNumber: true,
      assignedDriverId: true,
    },
  })

  if (!vehicle) {
    throw createHttpError(404, 'Tracked vehicle was not found.')
  }

  const trip = input.tripId
    ? await prisma.trip.findUnique({
        where: { id: input.tripId },
        select: {
          id: true,
          routeName: true,
          status: true,
          vehicleId: true,
          driverId: true,
        },
      })
    : null

  if (input.tripId && !trip) {
    throw createHttpError(404, 'Tracked trip was not found.')
  }

  if (trip && trip.vehicleId !== vehicle.id) {
    throw createHttpError(409, 'Tracking trip does not belong to the supplied vehicle.')
  }

  if (trip?.status === 'COMPLETED') {
    throw createHttpError(409, 'Completed trips cannot receive new live tracking pings.')
  }

  const resolvedDriverId = input.driverId ?? trip?.driverId ?? vehicle.assignedDriverId ?? null

  if (vehicle.assignedDriverId && resolvedDriverId && vehicle.assignedDriverId !== resolvedDriverId) {
    throw createHttpError(409, `${vehicle.plateNumber} is assigned to a different driver.`)
  }

  if (trip && resolvedDriverId && trip.driverId !== resolvedDriverId) {
    throw createHttpError(409, 'Tracking trip and driver do not match.')
  }

  if (resolvedDriverId) {
    const [driver, driverAssignedVehicle] = await Promise.all([
      prisma.driver.findUnique({
        where: { id: resolvedDriverId },
        select: { id: true, name: true },
      }),
      prisma.vehicle.findFirst({
        where: { assignedDriverId: resolvedDriverId },
        select: { id: true, plateNumber: true },
      }),
    ])

    if (!driver) {
      throw createHttpError(404, 'Tracked driver was not found.')
    }

    if (driverAssignedVehicle && driverAssignedVehicle.id !== vehicle.id) {
      throw createHttpError(409, `${driver.name} is already assigned to vehicle ${driverAssignedVehicle.plateNumber}.`)
    }
  }

  const ping = await prisma.vehicleLocationPing.create({
    data: {
      vehicleId: input.vehicleId,
      driverId: resolvedDriverId,
      tripId: input.tripId ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      speedKph: input.speedKph ?? null,
      headingDeg: input.headingDeg ?? null,
      accuracyM: input.accuracyM ?? null,
      batteryLevel: input.batteryLevel ?? null,
      recordedAt: input.recordedAt ?? new Date(),
    },
    include: {
      vehicle: true,
      driver: true,
      trip: true,
    },
  })

  const payload = toTrackingPayload(ping)
  broadcastTrackingUpdate(payload)
  return payload
}

export async function getLatestTracking() {
  const pings = await prisma.vehicleLocationPing.findMany({
    orderBy: {
      recordedAt: 'desc',
    },
    include: {
      vehicle: true,
      driver: true,
      trip: true,
    },
  })

  const latestByVehicle = new Map<string, TrackingBroadcastPayload>()
  for (const ping of pings) {
    if (!latestByVehicle.has(ping.vehicleId)) {
      latestByVehicle.set(ping.vehicleId, toTrackingPayload(ping))
    }
  }

  return Array.from(latestByVehicle.values())
}

function toTrackingPayload(ping: Awaited<ReturnType<typeof prisma.vehicleLocationPing.create>> & {
  vehicle: { id: string; plateNumber: string; make: string; model: string; status: string }
  driver: { id: string; name: string } | null
  trip: { id: string; routeName: string; status: string } | null
}): TrackingBroadcastPayload {
  return {
    id: ping.id,
    latitude: ping.latitude,
    longitude: ping.longitude,
    speedKph: ping.speedKph,
    headingDeg: ping.headingDeg,
    accuracyM: ping.accuracyM,
    batteryLevel: ping.batteryLevel,
    recordedAt: ping.recordedAt.toISOString(),
    ageSeconds: Math.max(0, Math.round((Date.now() - ping.recordedAt.getTime()) / 1000)),
    vehicle: {
      id: ping.vehicle.id,
      plateNumber: ping.vehicle.plateNumber,
      make: ping.vehicle.make,
      model: ping.vehicle.model,
      status: ping.vehicle.status,
    },
    driver: ping.driver ? { id: ping.driver.id, name: ping.driver.name } : null,
    trip: ping.trip ? { id: ping.trip.id, routeName: ping.trip.routeName, status: ping.trip.status } : null,
  }
}