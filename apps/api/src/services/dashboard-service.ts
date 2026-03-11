import { prisma } from '../lib/prisma.js'

export async function getDashboardSummary() {
  const [
    vehicleCount,
    activeVehicleCount,
    driverCount,
    activeTripCount,
    maintenanceDueCount,
    vehicleStatusGroups,
    recentTrips,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
    prisma.driver.count(),
    prisma.trip.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.maintenanceRecord.count({
      where: {
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
    }),
    prisma.vehicle.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    }),
    prisma.trip.findMany({
      take: 6,
      orderBy: {
        departureAt: 'desc',
      },
      include: {
        driver: {
          select: {
            name: true,
          },
        },
        vehicle: {
          select: {
            plateNumber: true,
          },
        },
      },
    }),
  ])

  return {
    totals: {
      vehicles: vehicleCount,
      activeVehicles: activeVehicleCount,
      drivers: driverCount,
      activeTrips: activeTripCount,
      maintenanceDue: maintenanceDueCount,
    },
    vehicleStatus: vehicleStatusGroups.map((entry) => ({
      name: entry.status,
      value: entry._count.status,
    })),
    recentTrips: recentTrips.map((trip) => ({
      id: trip.id,
      routeName: trip.routeName,
      status: trip.status,
      distanceKm: trip.distanceKm,
      departureAt: trip.departureAt,
      driverName: trip.driver.name,
      plateNumber: trip.vehicle.plateNumber,
    })),
  }
}