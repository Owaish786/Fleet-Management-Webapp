import { type FormEvent, useEffect, useState } from 'react'

import { fleetApi } from '../lib/api'
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
      {/* ── Records list ── */}
      <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          Workshop queue
        </p>
        <h3 className="font-display text-base font-bold text-slate-800">Maintenance records</h3>

        {error && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">
            {error}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
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
              {records.map((record) => (
                <tr key={record.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3 font-mono text-xs font-medium text-slate-800">{record.vehicle.plateNumber}</td>
                  <td className="px-3 py-3 text-slate-600">{record.type}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{new Date(record.scheduledFor).toLocaleDateString()}</td>
                  <td className="px-3 py-3 text-slate-600">{record.cost ? `$${record.cost.toLocaleString()}` : 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Create form ── */}
      <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          Schedule maintenance
        </p>
        <h3 className="font-display mb-4 text-base font-bold text-slate-800">Add a workshop task</h3>

        <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit}>
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
            className="col-span-2 mt-1 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Create record'}
          </button>
        </form>
      </section>
    </div>
  )
}