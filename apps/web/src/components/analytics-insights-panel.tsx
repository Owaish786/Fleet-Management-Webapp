import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { FleetAnalyticsInsights } from '../types/fleet'

interface AnalyticsInsightsPanelProps {
  insights: FleetAnalyticsInsights
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

export function AnalyticsInsightsPanel({ insights }: AnalyticsInsightsPanelProps) {
  return (
    <section className="animate-fade-up col-span-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Predictive intelligence</p>
          <h3 className="font-display text-xl font-bold text-slate-900">Data-driven operations cockpit</h3>
          <p className="mt-1 text-sm text-slate-500">Fuel forecasting, behavior risk flags, route quality signals, and maintenance prediction from live fleet data.</p>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Updated {new Date(insights.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Fuel trend</h4>
            <p className="text-sm font-semibold text-slate-900">
              Next est: {insights.fuelTrend.predictedNextMonthAvgFuelPer100Km ?? 'n/a'} L/100km
            </p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights.fuelTrend.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} width={40} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="avgFuelPer100Km"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 0, fill: '#6366f1' }}
                  name="Avg fuel (L/100km)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Abnormal driver behavior</p>
            <p className="mt-1 text-sm text-slate-600">Overspeed threshold: {insights.abnormalDriverBehavior.thresholdKph} km/h</p>
            <div className="mt-3 space-y-2">
              {insights.abnormalDriverBehavior.drivers.slice(0, 4).map((driver) => (
                <div key={driver.driverId} className="rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-900">{driver.driverName}</p>
                  <p className="text-slate-600">Score {driver.anomalyScore} · {driver.overspeedEvents} overspeed events</p>
                </div>
              ))}
              {insights.abnormalDriverBehavior.drivers.length === 0 && (
                <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">No anomaly signals yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Maintenance forecast</p>
            <p className="mt-1 text-sm text-slate-600">
              High-risk vehicles: <span className="font-semibold text-slate-900">{insights.maintenancePrediction.highRiskCount}</span>
            </p>
            <div className="mt-3 space-y-2">
              {insights.maintenancePrediction.vehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle.vehicleId} className="rounded-lg border border-amber-100 bg-white px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-900">{vehicle.plateNumber}</p>
                  <p className="text-slate-600">Risk {vehicle.riskScore} ({vehicle.riskLevel}) · service in {vehicle.recommendedServiceInDays} days</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Route optimization signal</p>
        {insights.routeOptimization.bestByFuelEfficiency ? (
          <p className="mt-1 text-sm text-slate-700">
            Most fuel-efficient lane: <span className="font-semibold text-slate-900">{insights.routeOptimization.bestByFuelEfficiency.routeKey}</span>
            {' '}at {insights.routeOptimization.bestByFuelEfficiency.avgFuelPer100Km} L/100km
            {' '}across {insights.routeOptimization.bestByFuelEfficiency.sampleTrips} trips.
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-700">Not enough trip history to score route efficiency yet.</p>
        )}
      </div>
    </section>
  )
}
