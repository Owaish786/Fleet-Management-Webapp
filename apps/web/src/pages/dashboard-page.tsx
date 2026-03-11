import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { StatCard } from '../components/stat-card'
import { fleetApi } from '../lib/api'
import { formatDateTime } from '../lib/formatters'
import { statusBadgeClass } from '../lib/status-styles'
import type { DashboardSummary } from '../types/fleet'

const PIE_COLORS = ['#10b981', '#f59e0b', '#94a3b8']

const STATUS_META: Record<string, { label: string; ring: string; text: string; bg: string }> = {
  ACTIVE: {
    label: 'Active',
    ring: 'ring-emerald-100',
    text: 'text-emerald-700',
    bg: 'bg-emerald-500',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    ring: 'ring-amber-100',
    text: 'text-amber-700',
    bg: 'bg-amber-500',
  },
  IDLE: {
    label: 'Idle',
    ring: 'ring-slate-200',
    text: 'text-slate-700',
    bg: 'bg-slate-400',
  },
}

const fallbackSummary: DashboardSummary = {
  totals: {
    vehicles: 48,
    activeVehicles: 31,
    drivers: 44,
    activeTrips: 12,
    maintenanceDue: 6,
  },
  vehicleStatus: [
    { name: 'ACTIVE', value: 31 },
    { name: 'MAINTENANCE', value: 10 },
    { name: 'IDLE', value: 7 },
  ],
  recentTrips: [
    {
      id: 'preview-1',
      routeName: 'Delhi to Jaipur',
      status: 'IN_PROGRESS',
      distanceKm: 281,
      departureAt: new Date().toISOString(),
      driverName: 'Raj Malhotra',
      plateNumber: 'DL01AB2451',
    },
    {
      id: 'preview-2',
      routeName: 'Mumbai to Pune',
      status: 'COMPLETED',
      distanceKm: 149,
      departureAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      driverName: 'Priya Sharma',
      plateNumber: 'MH02TR1187',
    },
    {
      id: 'preview-3',
      routeName: 'Bengaluru to Mysuru',
      status: 'SCHEDULED',
      distanceKm: 145,
      departureAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
      driverName: 'Neha Reddy',
      plateNumber: 'KA05GX7740',
    },
  ],
}

const tooltipStyle = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    color: '#1e293b',
    fontSize: 13,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  itemStyle: { color: '#334155' },
}

function formatRouteLabel(label: string) {
  if (label.length <= 14) return label
  return `${label.slice(0, 12)}...`
}

const routeRanges = [
  { key: '24H', label: '24h' },
  { key: '7D', label: '7d' },
  { key: 'ALL', label: 'All' },
] as const

type RouteRange = (typeof routeRanges)[number]['key']

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [routeRange, setRouteRange] = useState<RouteRange>('7D')

  useEffect(() => {
    async function loadSummary() {
      try {
        setError(null)
        setSummary(await fleetApi.getDashboard())
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.')
      }
    }

    void loadSummary()
  }, [])

  const displaySummary = summary ?? fallbackSummary
  const filteredTrips = useMemo(() => {
    const now = Date.now()
    const rangeStart =
      routeRange === '24H'
        ? now - 1000 * 60 * 60 * 24
        : routeRange === '7D'
          ? now - 1000 * 60 * 60 * 24 * 7
          : null

    return displaySummary.recentTrips.filter((trip) => {
      if (rangeStart === null) return true
      return new Date(trip.departureAt).getTime() >= rangeStart
    })
  }, [displaySummary.recentTrips, routeRange])

  const analyticsTrips = filteredTrips.length > 0 ? filteredTrips : displaySummary.recentTrips
  const totalVehicles = displaySummary.vehicleStatus.reduce((total, item) => total + item.value, 0)
  const totalDistance = analyticsTrips.reduce((total, trip) => total + trip.distanceKm, 0)
  const avgDistance = analyticsTrips.length
    ? Math.round(totalDistance / analyticsTrips.length)
    : 0
  const peakTrip = [...analyticsTrips].sort((a, b) => b.distanceKm - a.distanceKm)[0]
  const completionRate = analyticsTrips.length
    ? Math.round((analyticsTrips.filter((trip) => trip.status === 'COMPLETED').length / analyticsTrips.length) * 100)
    : 0
  const inProgressRate = analyticsTrips.length
    ? Math.round((analyticsTrips.filter((trip) => trip.status === 'IN_PROGRESS').length / analyticsTrips.length) * 100)
    : 0
  const scheduledRate = analyticsTrips.length
    ? Math.round((analyticsTrips.filter((trip) => trip.status === 'SCHEDULED').length / analyticsTrips.length) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* ── Alert banners ── */}
      {error && (
        <div className="col-span-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Live backend is currently unavailable ({error}). Showing preview data.
        </div>
      )}

      {!summary && !error && (
        <div className="col-span-full rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          Syncing live fleet metrics...
        </div>
      )}

      {/* ── Hero banner ── */}
      <section className="animate-fade-up col-span-full overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),_transparent_30%)]" />
            <div className="relative">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
              Overview
              </p>
              <h3 className="max-w-xl font-display text-2xl font-bold leading-tight text-slate-900 sm:text-[2rem]">
                Keep the fleet moving with a cleaner view of utilization, route pressure, and workshop load.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                A live operations snapshot for dispatchers and fleet managers, tuned for quick scanning instead of spreadsheet-style noise.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total distance</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{totalDistance} km</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Average route</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{avgDistance} km</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Peak route</p>
                  <p className="mt-2 truncate text-lg font-bold tracking-tight text-slate-900">{peakTrip?.routeName ?? 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Dispatch pulse</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{displaySummary.totals.activeTrips}</p>
                <p className="mt-1 text-sm text-slate-500">Trips currently moving across the network.</p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Workshop load</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{displaySummary.totals.maintenanceDue}</p>
                <p className="mt-1 text-sm text-slate-500">Assets requiring immediate service attention.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Coverage</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{displaySummary.totals.activeVehicles}/{displaySummary.totals.vehicles}</p>
                <p className="mt-1 text-sm text-slate-500">Vehicles ready for dispatch right now.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stat cards ── */}
      <div className="col-span-full grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Fleet size" value={displaySummary.totals.vehicles} detail="Total registered vehicles" meta="assets" accentClass="from-brand-500/20 via-brand-100/60 to-transparent" />
        <StatCard label="Active assets" value={displaySummary.totals.activeVehicles} detail="Vehicles ready for dispatch" meta="ready" accentClass="from-emerald-500/20 via-emerald-100/60 to-transparent" />
        <StatCard label="Drivers" value={displaySummary.totals.drivers} detail="Operators in the roster" meta="people" accentClass="from-cyan-500/20 via-cyan-100/60 to-transparent" />
        <StatCard label="Trips in motion" value={displaySummary.totals.activeTrips} detail="Currently in progress" meta="live" accentClass="from-amber-500/20 via-amber-100/60 to-transparent" />
      </div>

      <section className="animate-fade-up col-span-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Ops signals</p>
            <h3 className="font-display text-xl font-bold text-slate-900">What deserves attention right now</h3>
            <p className="mt-1 text-sm text-slate-500">A fast operational readout based on the current route window and fleet state.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {routeRange}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_1fr]">
          <div className="rounded-[1.5rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-cyan-50 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">Priority lane</p>
            <h4 className="mt-2 text-lg font-bold text-slate-900">{peakTrip?.routeName ?? 'No route activity yet'}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {peakTrip
                ? `${peakTrip.driverName} is carrying the heaviest route in the current window on ${peakTrip.plateNumber}.`
                : 'Route volume will surface here as trips are created.'}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Distance</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{peakTrip?.distanceKm ?? 0} km</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Status</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{peakTrip?.status ?? 'Idle'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Route mix</p>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Completed', value: completionRate, color: 'bg-emerald-500' },
                { label: 'In progress', value: inProgressRate, color: 'bg-brand-500' },
                { label: 'Scheduled', value: scheduledRate, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Daily posture</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Asset readiness</p>
                <p className="mt-1 text-sm text-slate-500">{displaySummary.totals.activeVehicles} vehicles are dispatch-ready out of {displaySummary.totals.vehicles}.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Workshop pressure</p>
                <p className="mt-1 text-sm text-slate-500">{displaySummary.totals.maintenanceDue} assets need maintenance attention.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Dispatch pulse</p>
                <p className="mt-1 text-sm text-slate-500">{displaySummary.totals.activeTrips} trips are active in the selected time view.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pie chart ── */}
      <section className="animate-fade-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
          Utilization
            </p>
            <h3 className="font-display text-xl font-bold text-slate-900">Vehicle status mix</h3>
            <p className="mt-1 text-sm text-slate-500">Operational balance across active, maintenance, and idle units.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {totalVehicles} units
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="h-72 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(99,102,241,0.08),rgba(255,255,255,0))] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displaySummary.vehicleStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={104}
                  stroke="#ffffff"
                  strokeWidth={4}
                >
                  <Label
                    position="center"
                    content={({ viewBox }) => {
                      const pieViewBox = viewBox as { cx?: number; cy?: number } | undefined
                      const cx = pieViewBox?.cx ?? 0
                      const cy = pieViewBox?.cy ?? 0
                      return (
                        <g>
                          <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-900 text-[30px] font-bold">
                            {totalVehicles}
                          </text>
                          <text x={cx} y={cy + 18} textAnchor="middle" className="fill-slate-500 text-[12px] font-semibold uppercase tracking-[0.22em]">
                            Vehicles
                          </text>
                        </g>
                      )
                    }}
                  />
                  {displaySummary.vehicleStatus.map((_entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {displaySummary.vehicleStatus.map((status) => {
              const meta = STATUS_META[status.name]
              const percentage = totalVehicles ? Math.round((status.value / totalVehicles) * 100) : 0

              return (
                <div key={status.name} className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ${meta?.ring ?? 'ring-slate-100'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${meta?.bg ?? 'bg-slate-400'}`} />
                      <div>
                        <p className={`text-sm font-semibold ${meta?.text ?? 'text-slate-700'}`}>{meta?.label ?? status.name}</p>
                        <p className="text-sm text-slate-500">{status.value} vehicles in this state</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{percentage}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${meta?.bg ?? 'bg-slate-400'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Bar chart ── */}
      <section className="animate-fade-up overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Recent routes
            </p>
            <h3 className="font-display text-xl font-bold text-slate-900">Distance covered by latest trips</h3>
            <p className="mt-1 text-sm text-slate-500">Recent lane performance, ranked by route distance.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {routeRanges.map((range) => (
              <button
                key={range.key}
                type="button"
                onClick={() => setRouteRange(range.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                  routeRange === range.key
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                {range.label}
              </button>
            ))}
            <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              Avg {avgDistance} km
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(79,70,229,0.06),rgba(255,255,255,0))] p-4">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsTrips} barCategoryGap="22%">
                <defs>
                  <linearGradient id="routeBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.98} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.78} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#dbe4f0" />
                <XAxis
                  dataKey="routeName"
                  tickFormatter={formatRouteLabel}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(79, 70, 229, 0.06)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-900/10">
                        <p className="text-sm font-semibold text-slate-900">{label}</p>
                        <p className="mt-1 text-sm text-slate-500">Distance</p>
                        <p className="text-lg font-bold text-brand-700">{payload[0]?.value} km</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="distanceKm" fill="url(#routeBar)" radius={[12, 12, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Longest trip</p>
              <p className="mt-2 truncate text-sm font-semibold text-slate-900">{peakTrip?.routeName ?? 'None'}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Driver focus</p>
              <p className="mt-2 truncate text-sm font-semibold text-slate-900">{peakTrip?.driverName ?? 'Unassigned'}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Vehicle</p>
              <p className="mt-2 truncate text-sm font-semibold text-slate-900">{peakTrip?.plateNumber ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trip feed table ── */}
      <section className="animate-fade-up col-span-full rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
          Trip feed
            </p>
            <h3 className="font-display text-xl font-bold text-slate-900">Latest route activity</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {displaySummary.recentTrips.length} routes
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Route</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Driver</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vehicle</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Distance</th>
              </tr>
            </thead>
            <tbody>
              {analyticsTrips.map((trip) => (
                <tr key={trip.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                  <td className="px-3 py-3 font-medium text-slate-800">
                    <div>
                      <p className="font-semibold text-slate-900">{trip.routeName}</p>
                      <p className="text-xs text-slate-400">Departure {formatDateTime(trip.departureAt)}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{trip.driverName}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">{trip.plateNumber}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(trip.status)}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{trip.distanceKm} km</td>
                </tr>
              ))}
              {analyticsTrips.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">
                    No trips found for the selected time range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}