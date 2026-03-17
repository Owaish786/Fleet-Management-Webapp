import { PrismaClient, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Constants
const DEMO_EMAIL = 'admin@haulsync.in'
const DEMO_PASSWORD = 'password123'
const SALT_ROUNDS = 10

// Utils
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min
const randomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const ONE_DAY = 24 * 60 * 60 * 1000

// Seed Data
const DRIVER_NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh',
  'Anjali Desai', 'Rahul Verma', 'Kavita Iyer', 'Sanjay Mehta', 'Deepak Reddy'
]

const VEHICLE_MODELS = [
  { make: 'Tata', model: 'Prima 5530', type: 'Heavy Truck' },
  { make: 'Ashok Leyland', model: 'Ecomet 1615', type: 'Medium Truck' },
  { make: 'Mahindra', model: 'Bolero Camper', type: 'Light Truck' },
  { make: 'Eicher', model: 'Pro 3019', type: 'Truck' },
  { make: 'BharatBenz', model: '1923C', type: 'Construction Truck' },
  { make: 'Force', model: 'Traveller', type: 'Van' },
  { make: 'Tata', model: 'Ace Gold', type: 'Mini Truck' },
]

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'
]

async function main() {
  console.log('🌱 Starting seed...')

  // Cleanup
  await prisma.vehicleLocationPing.deleteMany()
  await prisma.maintenanceRecord.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Admin
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS)
  await prisma.user.create({
    data: {
      name: 'Fleet Admin',
      email: DEMO_EMAIL,
      password: hashedPassword,
    },
  })
  console.log('✅ Admin user created')

  // 2. Create Drivers
  const drivers = []
  for (const name of DRIVER_NAMES) {
    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNumber: `DL-${randomInt(1000000, 9999999)}`,
        phone: `+91 ${randomInt(70000, 99999)} ${randomInt(10000, 99999)}`,
        status: randomElement(Object.values(DriverStatus)),
        joinedAt: randomDate(new Date(Date.now() - 365 * ONE_DAY), new Date()),
      },
    })
    drivers.push(driver)
  }
  console.log(`✅ ${drivers.length} Drivers created`)

  // 3. Create Vehicles
  const vehicles = []
  for (let i = 0; i < 15; i++) {
    const v = randomElement(VEHICLE_MODELS)
    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber: `MH-${randomInt(10, 48)}-${String.fromCharCode(65 + randomInt(0, 25))}${String.fromCharCode(65 + randomInt(0, 25))}-${randomInt(1000, 9999)}`,
        make: v.make,
        model: v.model,
        year: randomInt(2018, 2025),
        mileage: randomInt(10000, 150000),
        status: randomElement(Object.values(VehicleStatus)),
      },
    })
    vehicles.push(vehicle)

    // Add Maintenance Records
    if (Math.random() > 0.6) {
      await prisma.maintenanceRecord.create({
        data: {
          vehicleId: vehicle.id,
          type: randomElement(['Oil Change', 'Tire Rotation', 'Brake Check', 'Engine Tune-up']),
          status: randomElement(Object.values(MaintenanceStatus)),
          scheduledFor: randomDate(new Date(), new Date(Date.now() + 30 * ONE_DAY)),
          cost: randomInt(2000, 15000),
        },
      })
    }
  }
  console.log(`✅ ${vehicles.length} Vehicles created`)

  // 4. Create Trips & Pings
  let tripCount = 0
  for (let i = 0; i < 40; i++) {
    const vehicle = randomElement(vehicles)
    const driver = randomElement(drivers)
    
    // Status Logic
    const status = Math.random() > 0.3 ? TripStatus.COMPLETED : (Math.random() > 0.5 ? TripStatus.IN_PROGRESS : TripStatus.SCHEDULED)
    
    const departure = randomDate(new Date(Date.now() - 30 * ONE_DAY), new Date())
    const arrival = status === TripStatus.COMPLETED 
      ? new Date(departure.getTime() + randomInt(2, 48) * 60 * 60 * 1000) 
      : null

    const origin = randomElement(CITIES)
    const destination = randomElement(CITIES.filter(c => c !== origin))
    const distanceKm = randomInt(100, 1500)
    
    // Fuel logic (approx 3-5 km/l for trucks)
    const fuelUsed = status === TripStatus.COMPLETED ? distanceKm / randomInt(3, 5) : null

    const trip = await prisma.trip.create({
      data: {
        vehicleId: vehicle.id,
        driverId: driver.id,
        origin,
        destination,
        routeName: `${origin} to ${destination}`,
        status,
        departureAt: departure,
        arrivalAt: arrival,
        distanceKm,
        fuelUsedLiters: fuelUsed ? parseFloat(fuelUsed.toFixed(1)) : null,
      }
    })
    tripCount++

    // Generate Pings for COMPLETED/IN_PROGRESS trips
    if (status !== TripStatus.SCHEDULED) {
      const pings: Prisma.VehicleLocationPingCreateManyInput[] = []
      const pingCount = 20
      
      // Rough Lat/Lng for India
      let lat = 20.5937
      let lng = 78.9629
      
      for (let j = 0; j < pingCount; j++) {
        lat += (Math.random() - 0.5) * 0.5
        lng += (Math.random() - 0.5) * 0.5
        
        // Add anomalies randomly through speed/heading signals.
        const speedKph = Math.random() > 0.9 ? randomInt(100, 120) : randomInt(40, 80)

        pings.push({
          tripId: trip.id,
          vehicleId: vehicle.id,
          driverId: driver.id,
          latitude: lat,
          longitude: lng,
          speedKph,
          headingDeg: randomInt(0, 360),
          recordedAt: new Date(departure.getTime() + j * 1000 * 60 * 30),
        })
      }
      
      await prisma.vehicleLocationPing.createMany({ data: pings })
    }
  }

  console.log(`✅ ${tripCount} Trips and associated pings created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })