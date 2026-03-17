import { prisma } from '../lib/prisma.js'

interface MonthlyFuelPoint {
  month: string
  totalFuelLiters: number
  totalDistanceKm: number
  avgFuelPer100Km: number
  tripCount: number
}

interface DriverAnomalyInsight {
  driverId: string
  driverName: string
  totalPings: number
  overspeedEvents: number
  abruptHeadingEvents: number
  anomalyScore: number
}

interface RouteOptimizationInsight {
  routeKey: string
  origin: string
  destination: string
  sampleTrips: number
  avgDistanceKm: number
  avgDurationMinutes: number | null
  avgFuelPer100Km: number | null
}

interface MaintenancePredictionInsight {
  vehicleId: string
  plateNumber: string
  mileage: number
  daysSinceLastCompletedMaintenance: number | null
  openMaintenanceRecords: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  recommendedServiceInDays: number
}

export interface FleetAnalyticsInsights {
  generatedAt: string
  fuelTrend: {
    history: MonthlyFuelPoint[]
    predictedNextMonthAvgFuelPer100Km: number | null
  }
  abnormalDriverBehavior: {
    thresholdKph: number
    drivers: DriverAnomalyInsight[]
  }
  routeOptimization: {
    candidates: RouteOptimizationInsight[]
    bestByFuelEfficiency: RouteOptimizationInsight | null
  }
  maintenancePrediction: {
    vehicles: MaintenancePredictionInsight[]
    highRiskCount: number
  }
}

const OVERSPEED_THRESHOLD_KPH = 95
const ABRUPT_HEADING_DELTA_DEG = 70
const MAX_HEADING_EVENT_WINDOW_SECONDS = 300
const DAY_MS = 1000 * 60 * 60 * 24

export async function getFleetAnalyticsInsights(): Promise<FleetAnalyticsInsights> {
  const [trips, pings, drivers, vehicles] = await Promise.all([
    prisma.trip.findMany({
      orderBy: { departureAt: 'asc' },
      include: {
        driver: { select: { id: true, name: true } },
      },
    }),
    prisma.vehicleLocationPing.findMany({
      where: {
        driverId: {
          not: null,
        },
      },
      orderBy: [{ driverId: 'asc' }, { recordedAt: 'asc' }],
      select: {
        driverId: true,
        speedKph: true,
        headingDeg: true,
        recordedAt: true,
      },
    }),
    prisma.driver.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.vehicle.findMany({
      select: {
        id: true,
        plateNumber: true,
        mileage: true,
        maintenanceRecords: {
          select: {
            status: true,
            completedAt: true,
            scheduledFor: true,
            createdAt: true,
          },
        },
      },
    }),
  ])

  const fuelTrend = buildFuelTrend(trips)
  const abnormalDriverBehavior = buildDriverAnomalyInsights(pings, drivers)
  const routeOptimization = buildRouteOptimizationInsights(trips)
  const maintenancePrediction = buildMaintenancePredictionInsights(vehicles)

  return {
    generatedAt: new Date().toISOString(),
    fuelTrend,
    abnormalDriverBehavior,
    routeOptimization,
    maintenancePrediction,
  }
}

function buildFuelTrend(trips: Array<{
  departureAt: Date
  distanceKm: number
  fuelUsedLiters: number | null
}>) {
  const monthly = new Map<string, { totalFuelLiters: number; totalDistanceKm: number; tripCount: number }>()

  for (const trip of trips) {
    if (trip.fuelUsedLiters === null) {
      continue
    }

    const month = `${trip.departureAt.getUTCFullYear()}-${String(trip.departureAt.getUTCMonth() + 1).padStart(2, '0')}`
    const current = monthly.get(month) ?? { totalFuelLiters: 0, totalDistanceKm: 0, tripCount: 0 }
    current.totalFuelLiters += trip.fuelUsedLiters
    current.totalDistanceKm += trip.distanceKm
    current.tripCount += 1
    monthly.set(month, current)
  }

  const history: MonthlyFuelPoint[] = Array.from(monthly.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month,
      totalFuelLiters: round(value.totalFuelLiters),
      totalDistanceKm: round(value.totalDistanceKm),
      tripCount: value.tripCount,
      avgFuelPer100Km: value.totalDistanceKm > 0 ? round((value.totalFuelLiters / value.totalDistanceKm) * 100) : 0,
    }))

  const recentSeries = history.slice(-6).map((point) => point.avgFuelPer100Km)
  const predictedNextMonthAvgFuelPer100Km = predictNextValueLinear(recentSeries)

  return {
    history,
    predictedNextMonthAvgFuelPer100Km,
  }
}

function buildDriverAnomalyInsights(
  pings: Array<{ driverId: string | null; speedKph: number | null; headingDeg: number | null; recordedAt: Date }>,
  drivers: Array<{ id: string; name: string }>,
) {
  const driverNameById = new Map(drivers.map((driver) => [driver.id, driver.name]))
  const insights = new Map<string, DriverAnomalyInsight>()

  const previousByDriver = new Map<string, { headingDeg: number; recordedAt: Date }>()

  for (const ping of pings) {
    if (!ping.driverId) {
      continue
    }

    const insight =
      insights.get(ping.driverId) ??
      {
        driverId: ping.driverId,
        driverName: driverNameById.get(ping.driverId) ?? 'Unknown driver',
        totalPings: 0,
        overspeedEvents: 0,
        abruptHeadingEvents: 0,
        anomalyScore: 0,
      }

    insight.totalPings += 1

    if (ping.speedKph !== null && ping.speedKph > OVERSPEED_THRESHOLD_KPH) {
      insight.overspeedEvents += 1
    }

    const previous = previousByDriver.get(ping.driverId)
    if (previous && ping.headingDeg !== null) {
      const elapsedSeconds = (ping.recordedAt.getTime() - previous.recordedAt.getTime()) / 1000
      const delta = circularAngleDelta(previous.headingDeg, ping.headingDeg)
      if (elapsedSeconds <= MAX_HEADING_EVENT_WINDOW_SECONDS && delta >= ABRUPT_HEADING_DELTA_DEG) {
        insight.abruptHeadingEvents += 1
      }
    }

    if (ping.headingDeg !== null) {
      previousByDriver.set(ping.driverId, { headingDeg: ping.headingDeg, recordedAt: ping.recordedAt })
    }

    insights.set(ping.driverId, insight)
  }

  const driversWithSignals = Array.from(insights.values())
    .map((entry) => {
      const overspeedRate = entry.totalPings > 0 ? entry.overspeedEvents / entry.totalPings : 0
      const headingRate = entry.totalPings > 0 ? entry.abruptHeadingEvents / entry.totalPings : 0
      const anomalyScore = round(overspeedRate * 0.7 + headingRate * 0.3)
      return {
        ...entry,
        anomalyScore,
      }
    })
    .filter((entry) => entry.totalPings >= 4)
    .sort((a, b) => b.anomalyScore - a.anomalyScore)
    .slice(0, 8)

  return {
    thresholdKph: OVERSPEED_THRESHOLD_KPH,
    drivers: driversWithSignals,
  }
}

function buildRouteOptimizationInsights(
  trips: Array<{
    routeName: string
    origin: string
    destination: string
    distanceKm: number
    fuelUsedLiters: number | null
    departureAt: Date
    arrivalAt: Date | null
  }>,
) {
  const byRoute = new Map<
    string,
    {
      routeName: string
      origin: string
      destination: string
      sampleTrips: number
      totalDistanceKm: number
      totalFuelLiters: number
      fuelTripCount: number
      totalDurationMinutes: number
      durationTripCount: number
    }
  >()

  for (const trip of trips) {
    const key = `${trip.origin} -> ${trip.destination}`
    const current =
      byRoute.get(key) ??
      {
        routeName: trip.routeName,
        origin: trip.origin,
        destination: trip.destination,
        sampleTrips: 0,
        totalDistanceKm: 0,
        totalFuelLiters: 0,
        fuelTripCount: 0,
        totalDurationMinutes: 0,
        durationTripCount: 0,
      }

    current.sampleTrips += 1
    current.totalDistanceKm += trip.distanceKm

    if (trip.fuelUsedLiters !== null) {
      current.totalFuelLiters += trip.fuelUsedLiters
      current.fuelTripCount += 1
    }

    if (trip.arrivalAt) {
      const durationMinutes = (trip.arrivalAt.getTime() - trip.departureAt.getTime()) / (1000 * 60)
      if (durationMinutes > 0) {
        current.totalDurationMinutes += durationMinutes
        current.durationTripCount += 1
      }
    }

    byRoute.set(key, current)
  }

  const candidates: RouteOptimizationInsight[] = Array.from(byRoute.entries())
    .map(([routeKey, value]) => {
      const avgFuelPer100Km =
        value.totalDistanceKm > 0 && value.fuelTripCount > 0
          ? round((value.totalFuelLiters / value.totalDistanceKm) * 100)
          : null

      return {
        routeKey,
        origin: value.origin,
        destination: value.destination,
        sampleTrips: value.sampleTrips,
        avgDistanceKm: round(value.totalDistanceKm / Math.max(1, value.sampleTrips)),
        avgDurationMinutes:
          value.durationTripCount > 0
            ? round(value.totalDurationMinutes / value.durationTripCount)
            : null,
        avgFuelPer100Km,
      }
    })
    .filter((candidate) => candidate.sampleTrips > 0)
    .sort((a, b) => {
      if (a.avgFuelPer100Km === null && b.avgFuelPer100Km === null) return 0
      if (a.avgFuelPer100Km === null) return 1
      if (b.avgFuelPer100Km === null) return -1
      return a.avgFuelPer100Km - b.avgFuelPer100Km
    })

  return {
    candidates: candidates.slice(0, 8),
    bestByFuelEfficiency: candidates.find((candidate) => candidate.avgFuelPer100Km !== null) ?? null,
  }
}

function buildMaintenancePredictionInsights(
  vehicles: Array<{
    id: string
    plateNumber: string
    mileage: number
    maintenanceRecords: Array<{
      status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
      completedAt: Date | null
      scheduledFor: Date
      createdAt: Date
    }>
  }>,
) {
  const now = Date.now()

  const predictions: MaintenancePredictionInsight[] = vehicles
    .map((vehicle) => {
      const completed = vehicle.maintenanceRecords
        .filter((record) => record.status === 'COMPLETED')
        .sort((a, b) => {
          const aDate = (a.completedAt ?? a.createdAt).getTime()
          const bDate = (b.completedAt ?? b.createdAt).getTime()
          return bDate - aDate
        })
      const openRecords = vehicle.maintenanceRecords.filter((record) => record.status !== 'COMPLETED')

      const lastCompleted = completed[0]
      const daysSinceLastCompletedMaintenance = lastCompleted
        ? Math.floor((now - (lastCompleted.completedAt ?? lastCompleted.createdAt).getTime()) / DAY_MS)
        : null

      const mileageFactor = Math.min(1, vehicle.mileage / 300000)
      const maintenanceGapFactor =
        daysSinceLastCompletedMaintenance === null
          ? 1
          : Math.min(1, daysSinceLastCompletedMaintenance / 180)
      const openMaintenanceFactor = Math.min(1, openRecords.length / 3)

      const riskScore = Math.round((mileageFactor * 0.5 + maintenanceGapFactor * 0.3 + openMaintenanceFactor * 0.2) * 100)
      const riskLevel: MaintenancePredictionInsight['riskLevel'] =
        riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW'

      return {
        vehicleId: vehicle.id,
        plateNumber: vehicle.plateNumber,
        mileage: vehicle.mileage,
        daysSinceLastCompletedMaintenance,
        openMaintenanceRecords: openRecords.length,
        riskScore,
        riskLevel,
        recommendedServiceInDays: Math.max(0, Math.round((100 - riskScore) * 0.5)),
      }
    })
    .sort((a, b) => b.riskScore - a.riskScore)

  return {
    vehicles: predictions.slice(0, 10),
    highRiskCount: predictions.filter((entry) => entry.riskLevel === 'HIGH').length,
  }
}

function circularAngleDelta(previous: number, current: number): number {
  const raw = Math.abs(current - previous)
  return Math.min(raw, 360 - raw)
}

function predictNextValueLinear(values: number[]): number | null {
  if (values.length < 2) {
    return null
  }

  const n = values.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  for (let index = 0; index < n; index += 1) {
    const x = index + 1
    const y = values[index]
    sumX += x
    sumY += y
    sumXY += x * y
    sumXX += x * x
  }

  const denominator = n * sumXX - sumX * sumX
  if (denominator === 0) {
    return round(values[n - 1])
  }

  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n
  const nextX = n + 1
  const prediction = slope * nextX + intercept
  return round(Math.max(0, prediction))
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
