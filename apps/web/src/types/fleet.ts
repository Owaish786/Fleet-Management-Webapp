export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'IDLE'
export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'OFF_DUTY'
export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'

export interface DriverOption {
  id: string
  name: string
}

export interface VehicleOption {
  id: string
  plateNumber: string
}

export interface Vehicle {
  id: string
  plateNumber: string
  make: string
  model: string
  year: number
  mileage: number
  status: VehicleStatus
  assignedDriver: DriverOption | null
  createdAt: string
}

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  phone: string
  status: DriverStatus
  joinedAt: string
  assignedVehicles: VehicleOption[]
}

export interface Trip {
  id: string
  routeName: string
  origin: string
  destination: string
  departureAt: string
  arrivalAt: string | null
  distanceKm: number
  status: TripStatus
  fuelUsedLiters: number | null
  notes: string | null
  driver: DriverOption
  vehicle: VehicleOption
}

export interface MaintenanceRecord {
  id: string
  type: string
  status: MaintenanceStatus
  scheduledFor: string
  completedAt: string | null
  cost: number | null
  notes: string | null
  vehicle: VehicleOption
}

export interface DashboardSummary {
  totals: {
    vehicles: number
    activeVehicles: number
    drivers: number
    activeTrips: number
    maintenanceDue: number
  }
  vehicleStatus: Array<{
    name: VehicleStatus
    value: number
  }>
  recentTrips: Array<{
    id: string
    routeName: string
    status: TripStatus
    distanceKm: number
    departureAt: string
    driverName: string
    plateNumber: string
  }>
}

export interface LiveTrackingPoint {
  id: string
  latitude: number
  longitude: number
  speedKph: number | null
  headingDeg: number | null
  accuracyM: number | null
  batteryLevel: number | null
  recordedAt: string
  ageSeconds: number
  vehicle: {
    id: string
    plateNumber: string
    make: string
    model: string
    status: VehicleStatus
  }
  driver: {
    id: string
    name: string
  } | null
  trip: {
    id: string
    routeName: string
    status: TripStatus
  } | null
}

export interface VehicleInput {
  plateNumber: string
  make: string
  model: string
  year: number
  mileage: number
  status: VehicleStatus
  assignedDriverId?: string | null
}

export interface VehicleAssignmentInput {
  assignedDriverId: string | null
  allowReassignment?: boolean
}

export interface DriverInput {
  name: string
  licenseNumber: string
  phone: string
  status: DriverStatus
}

export interface TripInput {
  routeName: string
  origin: string
  destination: string
  departureAt: string
  arrivalAt?: string | null
  distanceKm: number
  status: TripStatus
  fuelUsedLiters?: number | null
  notes?: string | null
  vehicleId: string
  driverId: string
}

export interface TripCompletionInput {
  arrivalAt?: string
  fuelUsedLiters?: number | null
  notes?: string | null
  releaseAssignment?: boolean
}

export interface MaintenanceInput {
  type: string
  status: MaintenanceStatus
  scheduledFor: string
  completedAt?: string | null
  cost?: number | null
  notes?: string | null
  vehicleId: string
}