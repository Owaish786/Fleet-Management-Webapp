import { type FormEvent, useEffect, useState } from 'react'

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

  const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder-slate-400 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      {/* ── Trip list ── */}
      <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          Dispatch board
        </p>
        <h3 className="font-display text-base font-bold text-slate-800">Trips</h3>

        {error && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">
            {error}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Route</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vehicle</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Driver</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Distance</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-800">
                    {trip.origin} → {trip.destination}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">{trip.vehicle.plateNumber}</td>
                  <td className="px-3 py-3 text-slate-600">{trip.driver.name}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(trip.status)}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{trip.distanceKm} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Create form ── */}
      <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          Schedule trip
        </p>
        <h3 className="font-display mb-4 text-base font-bold text-slate-800">Create a dispatch entry</h3>

        <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
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
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plateNumber}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Driver
            <select className={inputCls} value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} required>
              <option value="">Select driver</option>
              {drivers.map((d) => (
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
            className="col-span-2 mt-1 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Create trip'}
          </button>
        </form>
      </section>
    </div>
  )
}