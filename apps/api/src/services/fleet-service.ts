import { prisma } from '../lib/prisma.js'

export async function listVehicles(userId?: string) {
  return prisma.vehicle.findMany({
    where: userId ? { ownerId: userId } : undefined,
    orderBy: {
      createdAt: 'desc',
    },
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

export async function listDrivers(userId?: string) {
  return prisma.driver.findMany({
    where: userId ? { ownerId: userId } : undefined,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      assignedVehicles: {
        select: {
          id: true,
          plateNumber: true,
        },
      },
    },
  })
}

export async function listTrips(userId?: string) {
  return prisma.trip.findMany({
    where: userId ? { ownerId: userId } : undefined,
    orderBy: {
      departureAt: 'desc',
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
}

export async function listMaintenanceRecords(userId?: string) {
  const records = await prisma.maintenanceRecord.findMany({
    where: userId ? { ownerId: userId } : undefined,
    orderBy: {
      scheduledFor: 'asc',
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

  return records.map((record) => ({
    ...record,
    cost: record.cost ? Number(record.cost) : null,
  }))
}