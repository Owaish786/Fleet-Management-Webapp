import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { BadgeCheck, IdCard, Phone, Search, SlidersHorizontal, UserPlus, Users } from 'lucide-react'

import { fleetApi } from '../lib/api'
import { formatDate } from '../lib/formatters'
import { indianLicensePattern, indianPhonePattern, normalizeLicenseInput } from '../lib/india-validation'
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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | DriverStatus>('ALL')
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

  const availableDrivers = useMemo(
    () => drivers.filter((driver) => driver.status === 'AVAILABLE').length,
    [drivers],
  )

  const assignedDrivers = useMemo(
    () => drivers.filter((driver) => driver.assignedVehicles.length > 0).length,
    [drivers],
  )

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return drivers.filter((driver) => {
      if (statusFilter !== 'ALL' && driver.status !== statusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return [
        driver.name,
        driver.licenseNumber,
        driver.phone,
        driver.assignedVehicles.map((vehicle) => vehicle.plateNumber).join(' '),
      ].some((value) => value.toLowerCase().includes(query))
    })
  }, [drivers, search, statusFilter])

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
      <section className="animate-fade-up col-span-full overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.08),_transparent_30%)]" />
            <div className="relative">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Crew roster</p>
              <h2 className="font-display text-2xl font-bold leading-tight text-slate-900">Keep operator coverage visible across dispatch, routing, and off-duty shifts.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Review workforce readiness, assignment load, and licensing details from one clean roster view.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Roster size</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{drivers.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Available</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{availableDrivers}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assigned</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{assignedDrivers}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Ready operators</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{availableDrivers}</p>
                <p className="mt-1 text-sm text-slate-500">Drivers currently free for new dispatch work.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Utilization</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{assignedDrivers}</p>
                <p className="mt-1 text-sm text-slate-500">Operators already attached to active vehicles.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Driver list ── */}
      <section className="animate-fade-up rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Crew roster</p>
            <h3 className="font-display text-xl font-bold text-slate-900">Drivers</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{filteredDrivers.length} of {drivers.length}</span>
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
              placeholder="Search driver, licence, phone, or vehicle"
            />
          </label>
          <label className="relative block">
            <SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'ALL' | DriverStatus)}
            >
              <option value="ALL">All statuses</option>
              {driverStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 overflow-x-auto">
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
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                  <td className="px-3 py-3 font-medium text-slate-800">
                    <div>
                      <p className="font-semibold text-slate-900">{driver.name}</p>
                      <p className="text-xs text-slate-400">Joined {formatDate(driver.joinedAt)}</p>
                    </div>
                  </td>
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
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">No drivers match the current search or filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Create form ── */}
      <section className="animate-fade-up rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-emerald-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Add driver</p>
              <p className="mt-1 text-sm text-slate-600">Register a new operator with contact and licensing details.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Users size={16} /> Identity</div>
            <p className="mt-1 text-xs text-slate-500">Keep names and roster records clean.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><IdCard size={16} /> License</div>
            <p className="mt-1 text-xs text-slate-500">Track unique license numbers.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Phone size={16} /> Contact</div>
            <p className="mt-1 text-xs text-slate-500">Maintain direct communication details.</p>
          </div>
        </div>

        <form className="mt-5 grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Full name
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            License number
            <input
              className={inputCls}
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: normalizeLicenseInput(e.target.value) })}
              placeholder="DL-482190"
              pattern={indianLicensePattern}
              title="Use an Indian licence number like DL-482190"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Phone
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              pattern={indianPhonePattern}
              title="Use an Indian phone number like +91 98765 43210"
              required
            />
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
            className="col-span-2 mt-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Create driver'}
          </button>

          <div className="col-span-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2 text-slate-700"><BadgeCheck size={14} /> Driver records now validate Indian licence and phone formats before they enter dispatch workflows.</div>
          </div>
        </form>
      </section>
    </div>
  )
}