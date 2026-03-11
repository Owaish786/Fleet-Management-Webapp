import { type FormEvent, useEffect, useState } from 'react'

import { fleetApi } from '../lib/api'
import { statusBadgeClass } from '../lib/status-styles'
import type { Driver, Vehicle, VehicleInput, VehicleStatus } from '../types/fleet'

const initialVehicle: VehicleInput = {
  plateNumber: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: 0,
  status: 'ACTIVE',
  assignedDriverId: null,
}

const vehicleStatuses: VehicleStatus[] = ['ACTIVE', 'MAINTENANCE', 'IDLE']

const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder-slate-400 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [form, setForm] = useState<VehicleInput>(initialVehicle)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadData() {
    try {
      setError(null)
      const [vehiclesResult, driversResult] = await Promise.all([
        fleetApi.getVehicles(),
        fleetApi.getDrivers(),
      ])
      setVehicles(vehiclesResult)
      setDrivers(driversResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load vehicles.')
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
      await fleetApi.createVehicle(form)
      setForm(initialVehicle)
      await loadData()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create vehicle.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      {/* ── Vehicle list ── */}
      <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          Fleet registry
        </p>
        <h3 className="font-display text-base font-bold text-slate-800">Vehicles</h3>

        {error && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">
            {error}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Plate</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vehicle</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mileage</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Driver</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3 font-mono text-xs font-medium text-slate-800">{vehicle.plateNumber}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{vehicle.mileage.toLocaleString()} km</td>
                  <td className="px-3 py-3 text-slate-600">{vehicle.assignedDriver?.name ?? 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Create form ── */}
      <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          Add vehicle
        </p>
        <h3 className="font-display mb-4 text-base font-bold text-slate-800">Create a new fleet asset</h3>

        <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Plate number
            <input className={inputCls} value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Make
            <input className={inputCls} value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Model
            <input className={inputCls} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Year
            <input className={inputCls} type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Mileage
            <input className={inputCls} type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Status
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}>
              {vehicleStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-600">
            Assigned driver
            <select
              className={inputCls}
              value={form.assignedDriverId ?? ''}
              onChange={(e) => setForm({ ...form, assignedDriverId: e.target.value || null })}
            >
              <option value="">Unassigned</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="col-span-2 mt-1 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Create vehicle'}
          </button>
        </form>
      </section>
    </div>
  )
}