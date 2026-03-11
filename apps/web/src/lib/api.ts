import type {
  DashboardSummary,
  Driver,
  DriverInput,
  LiveTrackingPoint,
  MaintenanceInput,
  MaintenanceRecord,
  Trip,
  TripCompletionInput,
  TripInput,
  Vehicle,
  VehicleAssignmentInput,
  VehicleInput,
} from '../types/fleet'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? 'Request failed.')
  }

  return (await response.json()) as T
}

export const fleetApi = {
  getDashboard: () => request<DashboardSummary>('/dashboard'),
  getLatestTracking: () => request<LiveTrackingPoint[]>('/tracking/latest'),
  getVehicles: () => request<Vehicle[]>('/vehicles'),
  createVehicle: (payload: VehicleInput) =>
    request<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateVehicleAssignment: (vehicleId: string, payload: VehicleAssignmentInput) =>
    request<Vehicle>(`/vehicles/${vehicleId}/assignment`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getDrivers: () => request<Driver[]>('/drivers'),
  createDriver: (payload: DriverInput) =>
    request<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getTrips: () => request<Trip[]>('/trips'),
  createTrip: (payload: TripInput) =>
    request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  completeTrip: (tripId: string, payload: TripCompletionInput) =>
    request<Trip>(`/trips/${tripId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getMaintenance: () => request<MaintenanceRecord[]>('/maintenance'),
  createMaintenance: (payload: MaintenanceInput) =>
    request<MaintenanceRecord>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

export interface AuthUser {
  id: string
  name: string
  email: string
  createdAt: string
}

interface AuthResponse {
  user: AuthUser
  token: string
}

interface ForgotPasswordResponse {
  ok: boolean
  message: string
}

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  forgotPassword: (payload: { email: string }) =>
    request<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<{ user: AuthUser }>('/auth/me'),
}