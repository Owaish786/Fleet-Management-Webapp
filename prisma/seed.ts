import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.vehicleLocationPing.deleteMany()
  await prisma.maintenanceRecord.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.user.deleteMany()

  await Promise.all([
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