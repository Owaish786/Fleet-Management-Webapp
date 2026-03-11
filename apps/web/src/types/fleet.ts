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

export interface VehicleInput {
  plateNumber: string
  make: string
  model: string
  year: number
  mileage: number
  status: VehicleStatus
  assignedDriverId?: string | null
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

export interface MaintenanceInput {
  type: string
  status: MaintenanceStatus
  scheduledFor: string
  completedAt?: string | null
  cost?: number | null
  notes?: string | null
  vehicleId: string
}