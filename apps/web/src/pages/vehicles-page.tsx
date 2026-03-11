import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { CarFront, Gauge, Search, ShieldCheck, SlidersHorizontal, Truck, UserRound } from 'lucide-react'

import { fleetApi } from '../lib/api'
import { formatNumber } from '../lib/formatters'
import { indianPlatePattern, normalizePlateInput } from '../lib/india-validation'
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
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | VehicleStatus>('ALL')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assignmentBusyId, setAssignmentBusyId] = useState<string | null>(null)

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

  const activeVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === 'ACTIVE').length,
    [vehicles],
  )

  const assignedVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.assignedDriver !== null).length,
    [vehicles],
  )

  const avgMileage = useMemo(() => {
    if (!vehicles.length) return 0
    return Math.round(vehicles.reduce((sum, vehicle) => sum + vehicle.mileage, 0) / vehicles.length)
  }, [vehicles])

  const assignableDrivers = useMemo(
    () => drivers.filter((driver) => driver.assignedVehicles.length === 0),
    [drivers],
  )

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase()

    return vehicles.filter((vehicle) => {
      if (statusFilter !== 'ALL' && vehicle.status !== statusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return [
        vehicle.plateNumber,
        vehicle.make,
        vehicle.model,
        vehicle.assignedDriver?.name ?? '',
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [search, statusFilter, vehicles])

  useEffect(() => {
    setAssignmentDrafts((current) => {
      const next = { ...current }
      for (const vehicle of vehicles) {
        next[vehicle.id] = current[vehicle.id] ?? vehicle.assignedDriver?.id ?? ''
      }
      return next
    })
  }, [vehicles])

  async function handleAssignmentUpdate(vehicle: Vehicle, assignedDriverId: string | null) {
    const selectedDriver = assignedDriverId
      ? drivers.find((driver) => driver.id === assignedDriverId) ?? null
      : null
    const allowReassignment = Boolean(
      selectedDriver?.assignedVehicles[0] && selectedDriver.assignedVehicles[0].id !== vehicle.id,
    )

    try {
      setAssignmentBusyId(vehicle.id)
      setError(null)
      await fleetApi.updateVehicleAssignment(vehicle.id, {
        assignedDriverId,
        allowReassignment,
      })
      await loadData()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update vehicle assignment.')
    } finally {
      setAssignmentBusyId(null)
    }
  }

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
      <section className="animate-fade-up col-span-full overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),_transparent_30%)]" />
            <div className="relative">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Fleet registry</p>
              <h2 className="font-display text-2xl font-bold leading-tight text-slate-900">Track asset readiness, assignment coverage, and mileage at a glance.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Keep plates, assignment status, and maintenance pressure aligned without losing visibility on working inventory.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total assets</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{vehicles.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assigned</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{assignedVehicles}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Avg mileage</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{formatNumber(avgMileage)} km</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Ready for dispatch</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{activeVehicles}</p>
                <p className="mt-1 text-sm text-slate-500">Vehicles currently active and available to move.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Driver coverage</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{drivers.length}</p>
                <p className="mt-1 text-sm text-slate-500">Operators available for assignment planning.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vehicle list ── */}
      <section className="animate-fade-up rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Fleet registry</p>
            <h3 className="font-display text-xl font-bold text-slate-900">Vehicles</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {filteredVehicles.length} of {vehicles.length}
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {error}
          </div>
        )}

        <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/85 p-3 md:grid-cols-[1fr_180px]">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plate, make, model, or driver"
            />
          </label>
          <label className="relative block">
            <SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'ALL' | VehicleStatus)}
            >
              <option value="ALL">All statuses</option>
              {vehicleStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Plate</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vehicle</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mileage</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assignment</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => {
                const selectedDriverId = assignmentDrafts[vehicle.id] ?? vehicle.assignedDriver?.id ?? ''
                const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId) ?? null
                const selectedDriverAssignment = selectedDriver?.assignedVehicles[0] ?? null
                const hasAssignmentChange = selectedDriverId !== (vehicle.assignedDriver?.id ?? '')

                return (
                <tr key={vehicle.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">{vehicle.plateNumber}</span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-900">{vehicle.make} {vehicle.model}</p>
                      <p className="text-xs text-slate-400">Model year {vehicle.year}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{formatNumber(vehicle.mileage)} km</td>
                  <td className="px-3 py-3 text-slate-600">
                    <div className="space-y-2">
                      <p className="font-medium text-slate-800">{vehicle.assignedDriver?.name ?? 'Unassigned'}</p>
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        value={selectedDriverId}
                        onChange={(event) => {
                          const value = event.target.value
                          setAssignmentDrafts((current) => ({ ...current, [vehicle.id]: value }))
                        }}
                        disabled={assignmentBusyId === vehicle.id}
                      >
                        <option value="">Unassigned</option>
                        {drivers.map((driver) => {
                          const assignedVehicle = driver.assignedVehicles[0]
                          const suffix = assignedVehicle && assignedVehicle.id !== vehicle.id
                            ? ` • assigned to ${assignedVehicle.plateNumber}`
                            : ''

                          return (
                            <option key={driver.id} value={driver.id}>{driver.name}{suffix}</option>
                          )
                        })}
                      </select>
                      {selectedDriverAssignment && selectedDriverAssignment.id !== vehicle.id && (
                        <p className="text-xs text-amber-700">Applying this change will reassign {selectedDriver?.name} from {selectedDriverAssignment.plateNumber}.</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleAssignmentUpdate(vehicle, selectedDriverId || null)}
                          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={assignmentBusyId === vehicle.id || !hasAssignmentChange}
                        >
                          {assignmentBusyId === vehicle.id ? 'Saving' : selectedDriverAssignment && selectedDriverAssignment.id !== vehicle.id ? 'Reassign' : 'Apply'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleAssignmentUpdate(vehicle, null)}
                          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={assignmentBusyId === vehicle.id || !vehicle.assignedDriver}
                        >
                          Release
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )})}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">No vehicles match the current search or filter.</td>
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
              <Truck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Add vehicle</p>
              <p className="mt-1 text-sm text-slate-600">Register a new fleet asset with assignment and operating status.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CarFront size={16} /> Asset</div>
            <p className="mt-1 text-xs text-slate-500">Plate, make, model, year.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Gauge size={16} /> Mileage</div>
            <p className="mt-1 text-xs text-slate-500">Track current odometer state.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><UserRound size={16} /> Assignment</div>
            <p className="mt-1 text-xs text-slate-500">Attach a driver or leave it open.</p>
          </div>
        </div>

        <form className="mt-5 grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Plate number
            <input
              className={inputCls}
              value={form.plateNumber}
              onChange={(e) => setForm({ ...form, plateNumber: normalizePlateInput(e.target.value) })}
              placeholder="DL01AB2451"
              pattern={indianPlatePattern}
              title="Use an Indian registration number like DL01AB2451"
              required
            />
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
              {assignableDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="col-span-2 mt-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Create vehicle'}
          </button>

          <div className="col-span-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2 text-slate-700"><ShieldCheck size={14} /> New vehicles accept Indian registration numbers, and the table now supports explicit release or reassignment when dispatch plans change.</div>
          </div>
        </form>
      </section>
    </div>
  )
}