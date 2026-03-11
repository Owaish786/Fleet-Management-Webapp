import { prisma } from '../lib/prisma.js'

export async function listVehicles() {
  return prisma.vehicle.findMany({
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

export async function listDrivers() {
  return prisma.driver.findMany({
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

export async function listTrips() {
  return prisma.trip.findMany({
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

export async function listMaintenanceRecords() {
  const records = await prisma.maintenanceRecord.findMany({
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