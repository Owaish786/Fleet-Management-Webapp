import { type FormEvent, useEffect, useState } from 'react'

import { fleetApi } from '../lib/api'
import { statusBadgeClass } from '../lib/status-styles'
import type { Driver, DriverInput, DriverStatus } from '../types/fleet'

const initialDriver: DriverInput = {
  name: '',
  licenseNumber: '',
  phone: '',
  status: 'AVAILABLE',
}

const driverStatuses: DriverStatus[] = ['AVAILABLE', 'ON_ROUTE', 'OFF_DUTY']

const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder-slate-400 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

export function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [form, setForm] = useState<DriverInput>(initialDriver)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadDrivers() {
    try {
      setError(null)
      setDrivers(await fleetApi.getDrivers())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load drivers.')
    }
  }

  useEffect(() => {
    void loadDrivers()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      await fleetApi.createDriver(form)
      setForm(initialDriver)
      await loadDrivers()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create driver.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      {/* ── Driver list ── */}
      <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          Crew roster
        </p>
        <h3 className="font-display text-base font-bold text-slate-800">Drivers</h3>

        {error && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">
            {error}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">License</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned vehicles</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-800">{driver.name}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">{driver.licenseNumber}</td>
                  <td className="px-3 py-3 text-slate-600">{driver.phone}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(driver.status)}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{driver.assignedVehicles.map((v) => v.plateNumber).join(', ') || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Create form ── */}
      <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          Add driver
        </p>
        <h3 className="font-display mb-4 text-base font-bold text-slate-800">Register an operator</h3>

        <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Full name
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            License number
            <input className={inputCls} value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Phone
            <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Status
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DriverStatus })}>
              {driverStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="col-span-2 mt-1 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Create driver'}
          </button>
        </form>
      </section>
    </div>
  )
}