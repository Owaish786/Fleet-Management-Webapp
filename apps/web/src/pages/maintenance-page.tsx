import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { ClipboardList, Search, ShieldCheck, SlidersHorizontal, TimerReset, Truck, Wrench } from 'lucide-react'

import { fleetApi } from '../lib/api'
import { formatCurrencyInr, formatDate } from '../lib/formatters'
import { statusBadgeClass } from '../lib/status-styles'
import type {
  MaintenanceInput,
  MaintenanceRecord,
  MaintenanceStatus,
  Vehicle,
} from '../types/fleet'

const initialMaintenance: MaintenanceInput = {
  type: '',
  status: 'SCHEDULED',
  scheduledFor: new Date().toISOString().slice(0, 16),
  cost: null,
  notes: '',
  vehicleId: '',
}

const maintenanceStatuses: MaintenanceStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']

export function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [form, setForm] = useState<MaintenanceInput>(initialMaintenance)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | MaintenanceStatus>('ALL')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadData() {
    try {
      setError(null)
      const [recordsResult, vehiclesResult] = await Promise.all([
        fleetApi.getMaintenance(),
        fleetApi.getVehicles(),
      ])
      setRecords(recordsResult)
      setVehicles(vehiclesResult)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load maintenance.')
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const activeRecords = useMemo(
    () => records.filter((record) => record.status === 'IN_PROGRESS').length,
    [records],
  )

  const pendingCost = useMemo(
    () => records.reduce((sum, record) => sum + (record.cost ?? 0), 0),
    [records],
  )

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()

    return records.filter((record) => {
      if (statusFilter !== 'ALL' && record.status !== statusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return [record.type, record.vehicle.plateNumber, record.notes ?? ''].some((value) =>
        value.toLowerCase().includes(query),
      )
    })
  }, [records, search, statusFilter])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      await fleetApi.createMaintenance({
        ...form,
        scheduledFor: new Date(form.scheduledFor).toISOString(),
      })
      setForm(initialMaintenance)
      await loadData()
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to create maintenance record.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder-slate-400 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <section className="animate-fade-up col-span-full overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.08),_transparent_30%)]" />
            <div className="relative">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Workshop queue</p>
              <h2 className="font-display text-2xl font-bold leading-tight text-slate-900">Manage maintenance load with a cleaner view of tasks, timing, and cost exposure.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Keep service records readable for operations and workshop teams while preserving schedule and budget visibility.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Records</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{records.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">In progress</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{activeRecords}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Budgeted</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{formatCurrencyInr(pendingCost)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="space-y-3">
              <div className="rounded-2xl border border-amber-100 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Workshop load</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{activeRecords}</p>
                <p className="mt-1 text-sm text-slate-500">Tasks currently moving through the workshop queue.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Fleet coverage</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{vehicles.length}</p>
                <p className="mt-1 text-sm text-slate-500">Vehicles available for new maintenance scheduling.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Records list ── */}
      <section className="animate-fade-up rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Workshop queue</p>
            <h3 className="font-display text-xl font-bold text-slate-900">Maintenance records</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{filteredRecords.length} of {records.length}</span>
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
              placeholder="Search vehicle, task, or notes"
            />
          </label>
          <label className="relative block">
            <SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'ALL' | MaintenanceStatus)}
            >
              <option value="ALL">All statuses</option>
              {maintenanceStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vehicle</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Task</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Scheduled</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                  <td className="px-3 py-3 font-mono text-xs font-medium text-slate-800"><span className="rounded-full bg-slate-100 px-2.5 py-1">{record.vehicle.plateNumber}</span></td>
                  <td className="px-3 py-3 text-slate-600">{record.type}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{formatDate(record.scheduledFor)}</td>
                  <td className="px-3 py-3 text-slate-600">{record.cost ? formatCurrencyInr(record.cost) : 'Pending'}</td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">No maintenance records match the current search or filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Create form ── */}
      <section className="animate-fade-up rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-amber-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
              <Wrench size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Schedule maintenance</p>
              <p className="mt-1 text-sm text-slate-600">Log workshop work with scheduling, cost, and notes in one place.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><ClipboardList size={16} /> Task</div>
            <p className="mt-1 text-xs text-slate-500">Define the workshop operation clearly.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><TimerReset size={16} /> Schedule</div>
            <p className="mt-1 text-xs text-slate-500">Choose timing and progress stage.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Truck size={16} /> Vehicle</div>
            <p className="mt-1 text-xs text-slate-500">Attach the exact affected asset.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Wrench size={16} /> Cost</div>
            <p className="mt-1 text-xs text-slate-500">Track known budget or leave it pending.</p>
          </div>
        </div>

        <form className="mt-5 grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Task type
            <input className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Status
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as MaintenanceStatus })}
            >
              {maintenanceStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Scheduled for
            <input className={inputCls} type="datetime-local" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Cost
            <input
              className={inputCls}
              type="number"
              value={form.cost ?? ''}
              onChange={(e) => setForm({ ...form, cost: e.target.value ? Number(e.target.value) : null })}
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-600">
            Vehicle
            <select className={inputCls} value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plateNumber}</option>
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
            {isSubmitting ? 'Saving...' : 'Create record'}
          </button>

          <div className="col-span-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2 text-slate-700"><ShieldCheck size={14} /> Maintenance records feed into dashboard coverage and workshop load metrics.</div>
          </div>
        </form>
      </section>
    </div>
  )
}