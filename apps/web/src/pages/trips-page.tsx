import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { MapPinned, Route as RouteIcon, ShieldCheck, TimerReset, Truck, UserRound } from 'lucide-react'

import { fleetApi } from '../lib/api'
import { statusBadgeClass } from '../lib/status-styles'
import type { Driver, Trip, TripInput, TripStatus, Vehicle } from '../types/fleet'

const initialTrip: TripInput = {
  routeName: '',
  origin: '',
  destination: '',
  departureAt: new Date().toISOString().slice(0, 16),
  distanceKm: 0,
  status: 'SCHEDULED',
  fuelUsedLiters: null,
  notes: '',
  vehicleId: '',
  driverId: '',
}

const tripStatuses: TripStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']

export function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [form, setForm] = useState<TripInput>(initialTrip)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completionBusyId, setCompletionBusyId] = useState<string | null>(null)

  async function loadData() {
    try {
      setError(null)
      const [tripsResult, vehiclesResult, driversResult] = await Promise.all([
        fleetApi.getTrips(),
        fleetApi.getVehicles(),
        fleetApi.getDrivers(),
      ])
      setTrips(tripsResult)
      setVehicles(vehiclesResult)
      setDrivers(driversResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load trips.')
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const activeTrips = useMemo(
    () => trips.filter((trip) => trip.status === 'IN_PROGRESS').length,
    [trips],
  )

  const totalDistance = useMemo(
    () => trips.reduce((sum, trip) => sum + trip.distanceKm, 0),
    [trips],
  )

  const avgDistance = useMemo(() => {
    if (!trips.length) return 0
    return Math.round(totalDistance / trips.length)
  }, [totalDistance, trips.length])

  const activeVehicleIds = useMemo(
    () => new Set(trips.filter((trip) => trip.status === 'IN_PROGRESS').map((trip) => trip.vehicle.id)),
    [trips],
  )

  const activeDriverIds = useMemo(
    () => new Set(trips.filter((trip) => trip.status === 'IN_PROGRESS').map((trip) => trip.driver.id)),
    [trips],
  )

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === form.vehicleId) ?? null,
    [form.vehicleId, vehicles],
  )

  const selectedDriver = useMemo(
    () => drivers.find((driver) => driver.id === form.driverId) ?? null,
    [drivers, form.driverId],
  )

  const compatibleVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (form.status === 'IN_PROGRESS' && activeVehicleIds.has(vehicle.id)) {
        return false
      }

      if (form.status === 'IN_PROGRESS' && vehicle.status === 'MAINTENANCE') {
        return false
      }

      if (!selectedDriver) {
        return true
      }

      const selectedDriverAssignedVehicle = selectedDriver.assignedVehicles[0]
      if (selectedDriverAssignedVehicle) {
        return selectedDriverAssignedVehicle.id === vehicle.id
      }

      return !vehicle.assignedDriver || vehicle.assignedDriver.id === selectedDriver.id
    })
  }, [activeVehicleIds, form.status, selectedDriver, vehicles])

  const compatibleDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      if (form.status === 'IN_PROGRESS' && activeDriverIds.has(driver.id)) {
        return false
      }

      if (form.status === 'IN_PROGRESS' && driver.status === 'OFF_DUTY') {
        return false
      }

      if (!selectedVehicle) {
        return true
      }

      if (selectedVehicle.assignedDriver) {
        return selectedVehicle.assignedDriver.id === driver.id
      }

      const assignedVehicle = driver.assignedVehicles[0]
      return !assignedVehicle || assignedVehicle.id === selectedVehicle.id
    })
  }, [activeDriverIds, drivers, form.status, selectedVehicle])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      await fleetApi.createTrip({
        ...form,
        departureAt: new Date(form.departureAt).toISOString(),
      })
      setForm(initialTrip)
      await loadData()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create trip.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCompleteTrip(tripId: string, releaseAssignment: boolean) {
    try {
      setCompletionBusyId(tripId)
      setError(null)
      await fleetApi.completeTrip(tripId, {
        releaseAssignment,
      })
      await loadData()
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : 'Unable to complete trip.')
    } finally {
      setCompletionBusyId(null)
    }
  }

  useEffect(() => {
    if (form.driverId && !compatibleDrivers.some((driver) => driver.id === form.driverId)) {
      setForm((current) => ({ ...current, driverId: '' }))
    }
  }, [compatibleDrivers, form.driverId])

  useEffect(() => {
    if (form.vehicleId && !compatibleVehicles.some((vehicle) => vehicle.id === form.vehicleId)) {
      setForm((current) => ({ ...current, vehicleId: '' }))
    }
  }, [compatibleVehicles, form.vehicleId])

  const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder-slate-400 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <section className="animate-fade-up col-span-full overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),_transparent_30%)]" />
            <div className="relative">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Dispatch board</p>
              <h2 className="font-display text-2xl font-bold leading-tight text-slate-900">Schedule routes with clearer distance, assignment, and movement context.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Keep dispatch teams aligned on trip volume, route scale, and driver-vehicle pairing from one operational surface.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Trips</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{trips.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total distance</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{totalDistance} km</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Average route</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{avgDistance} km</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Trips in motion</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{activeTrips}</p>
                <p className="mt-1 text-sm text-slate-500">Routes currently underway across the network.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assignment pool</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{vehicles.length}/{drivers.length}</p>
                <p className="mt-1 text-sm text-slate-500">Vehicles and drivers available for trip creation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trip list ── */}
      <section className="animate-fade-up rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Dispatch board</p>
            <h3 className="font-display text-xl font-bold text-slate-900">Trips</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{trips.length} routes</span>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {error}
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Route</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vehicle</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Driver</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Distance</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                  <td className="px-3 py-3 font-medium text-slate-800">
                    <div>
                      <p className="font-semibold text-slate-900">{trip.origin} → {trip.destination}</p>
                      <p className="text-xs text-slate-400">{trip.routeName}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-500"><span className="rounded-full bg-slate-100 px-2.5 py-1">{trip.vehicle.plateNumber}</span></td>
                  <td className="px-3 py-3 text-slate-600">{trip.driver.name}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(trip.status)}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{trip.distanceKm} km</td>
                  <td className="px-3 py-3 text-slate-600">
                    {trip.status === 'IN_PROGRESS' ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleCompleteTrip(trip.id, false)}
                          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={completionBusyId === trip.id}
                        >
                          {completionBusyId === trip.id ? 'Saving' : 'Complete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleCompleteTrip(trip.id, true)}
                          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={completionBusyId === trip.id}
                        >
                          Complete + release
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">No trips scheduled yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Create form ── */}
      <section className="animate-fade-up rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
              <RouteIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Schedule trip</p>
              <p className="mt-1 text-sm text-slate-600">Create a dispatch entry with lane, timing, and assignment details.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><MapPinned size={16} /> Route</div>
            <p className="mt-1 text-xs text-slate-500">Origin, destination, and named trip lane.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><TimerReset size={16} /> Timing</div>
            <p className="mt-1 text-xs text-slate-500">Schedule departure and route length cleanly.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Truck size={16} /> Vehicle</div>
            <p className="mt-1 text-xs text-slate-500">Attach a working vehicle to the trip.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><UserRound size={16} /> Driver</div>
            <p className="mt-1 text-xs text-slate-500">Assign the operator responsible for movement.</p>
          </div>
        </div>

        <form className="mt-5 grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Route name
            <input className={inputCls} value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Origin
            <input className={inputCls} value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Destination
            <input className={inputCls} value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Departure
            <input className={inputCls} type="datetime-local" value={form.departureAt} onChange={(e) => setForm({ ...form, departureAt: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Distance (km)
            <input className={inputCls} type="number" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: Number(e.target.value) })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Status
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TripStatus })}>
              {tripStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Vehicle
            <select className={inputCls} value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
              <option value="">Select vehicle</option>
              {compatibleVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plateNumber}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Driver
            <select className={inputCls} value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} required>
              <option value="">Select driver</option>
              {compatibleDrivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-600">
            Notes
            <textarea className={`${inputCls} resize-y`} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </label>
          <button
            type="submit"
            className="col-span-2 mt-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Create trip'}
          </button>

          <div className="col-span-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2 text-slate-700"><ShieldCheck size={14} /> In-progress trips can now be completed directly here, with an optional release action when the vehicle should return to the open assignment pool.</div>
          </div>
        </form>
      </section>
    </div>
  )
}