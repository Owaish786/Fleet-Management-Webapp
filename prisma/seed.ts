import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DEMO_PASSWORD = 'password123'

async function main() {
  await prisma.maintenanceRecord.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12)

  await prisma.user.create({
    data: {
      name: 'Demo Admin',
      email: 'admin@haulsync.com',
      password: hashedPassword,
    },
  })

  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        name: 'Nadia Hassan',
        licenseNumber: 'DL-482190',
        phone: '+20 100 345 9981',
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Omar Khaled',
        licenseNumber: 'DL-593017',
        phone: '+20 100 938 4417',
        status: 'ON_ROUTE',
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Lina Salim',
        licenseNumber: 'DL-601822',
        phone: '+20 100 127 7734',
        status: 'OFF_DUTY',
      },
    }),
  ])

  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        plateNumber: 'CAI-2451',
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
        plateNumber: 'ALX-1187',
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
        plateNumber: 'GIZ-7740',
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
        routeName: 'Delta Supply Run',
        origin: 'Cairo',
        destination: 'Mansoura',
        departureAt: new Date(),
        distanceKm: 126,
        status: 'IN_PROGRESS',
        fuelUsedLiters: 34.5,
        vehicleId: vehicles[0].id,
        driverId: drivers[1].id,
        notes: 'Priority medical supplies.',
      },
    }),
    prisma.trip.create({
      data: {
        routeName: 'Coastal Delivery',
        origin: 'Alexandria',
        destination: 'Port Said',
        departureAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        arrivalAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        distanceKm: 212,
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