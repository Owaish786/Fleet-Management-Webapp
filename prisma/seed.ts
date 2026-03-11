import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DEMO_PASSWORD = 'password123'

async function main() {
  await prisma.vehicleLocationPing.deleteMany()
  await prisma.maintenanceRecord.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12)

  await prisma.user.create({
    data: {
      name: 'Aarav Mehta',
      email: 'admin@haulsync.in',
      password: hashedPassword,
    },
  })

  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        name: 'Priya Sharma',
        licenseNumber: 'DL-482190',
        phone: '+91 98765 43210',
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Raj Malhotra',
        licenseNumber: 'DL-593017',
        phone: '+91 99887 76655',
        status: 'ON_ROUTE',
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Neha Reddy',
        licenseNumber: 'DL-601822',
        phone: '+91 91234 56780',
        status: 'OFF_DUTY',
      },
    }),
  ])

  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        plateNumber: 'DL01AB2451',
        make: 'Mercedes-Benz',
        model: 'Actros',
        year: 2023,
        mileage: 184320,
        status: 'ACTIVE',
        assignedDriverId: drivers[1].id,
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: 'MH02TR1187',
        make: 'Volvo',
        model: 'FH16',
        year: 2022,
        mileage: 201450,
        status: 'MAINTENANCE',
        assignedDriverId: drivers[0].id,
      },
    }),
    prisma.vehicle.create({
      data: {
        plateNumber: 'KA05GX7740',
        make: 'Scania',
        model: 'R500',
        year: 2024,
        mileage: 98200,
        status: 'IDLE',
      },
    }),
  ])

  await Promise.all([
    prisma.trip.create({
      data: {
        routeName: 'Delhi Jaipur Corridor',
        origin: 'Delhi',
        destination: 'Jaipur',
        departureAt: new Date(),
        distanceKm: 281,
        status: 'IN_PROGRESS',
        fuelUsedLiters: 34.5,
        vehicleId: vehicles[0].id,
        driverId: drivers[1].id,
        notes: 'Priority pharma supplies for NCR and Rajasthan depots.',
      },
    }),
    prisma.trip.create({
      data: {
        routeName: 'Mumbai Pune Shuttle',
        origin: 'Mumbai',
        destination: 'Pune',
        departureAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        arrivalAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        distanceKm: 149,
        status: 'COMPLETED',
        fuelUsedLiters: 51.2,
        vehicleId: vehicles[2].id,
        driverId: drivers[0].id,
      },
    }),
  ])

  await Promise.all([
    prisma.maintenanceRecord.create({
      data: {
        type: 'Brake inspection',
        status: 'IN_PROGRESS',
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24),
        cost: 4200.5,
        notes: 'Pads and discs replacement.',
        vehicleId: vehicles[1].id,
      },
    }),
    prisma.maintenanceRecord.create({
      data: {
        type: 'Oil and filter service',
        status: 'SCHEDULED',
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        vehicleId: vehicles[0].id,
      },
    }),
  ])

  await Promise.all([
    prisma.vehicleLocationPing.create({
      data: {
        vehicleId: vehicles[0].id,
        driverId: drivers[1].id,
        tripId: (await prisma.trip.findFirst({ where: { vehicleId: vehicles[0].id } }))?.id,
        latitude: 28.1836,
        longitude: 76.6235,
        speedKph: 58,
        headingDeg: 102,
        accuracyM: 12,
        batteryLevel: 79,
        recordedAt: new Date(),
      },
    }),
    prisma.vehicleLocationPing.create({
      data: {
        vehicleId: vehicles[1].id,
        driverId: drivers[0].id,
        latitude: 19.076,
        longitude: 72.8777,
        speedKph: 0,
        headingDeg: 0,
        accuracyM: 8,
        batteryLevel: 54,
        recordedAt: new Date(Date.now() - 1000 * 60 * 18),
      },
    }),
    prisma.vehicleLocationPing.create({
      data: {
        vehicleId: vehicles[2].id,
        latitude: 12.9716,
        longitude: 77.5946,
        speedKph: 16,
        headingDeg: 245,
        accuracyM: 20,
        batteryLevel: 61,
        recordedAt: new Date(Date.now() - 1000 * 60 * 6),
      },
    }),
  ])
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })