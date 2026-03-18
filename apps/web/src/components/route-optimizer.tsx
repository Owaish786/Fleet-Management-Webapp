import { useState } from 'react'

const CITIES = ['Mumbai', 'Pune', 'Surat', 'Ahmedabad', 'Delhi', 'Jaipur', 'Bangalore', 'Chennai']

export function RoutePlannerPanel() {
  const [start, setStart] = useState('Mumbai')
  const [end, setEnd] = useState('Delhi')
  const [optimizeBy, setOptimizeBy] = useState<'distance' | 'time'>('distance')
  const [result, setResult] = useState<null | { path: string[]; totalMetric: number; metricUsed: string }>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOptimize = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
      const response = await fetch(`${API_URL}/route-optimization/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ start, end, optimizeBy }),
      })
      if (!response.ok) {
        throw new Error('Failed to find route')
      }
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <details className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <summary className="cursor-pointer list-none select-none">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-bold text-slate-900">Route Planner</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Optional
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Fleet Management helps teams track vehicles live, plan efficient routes, monitor fuel use, evaluate driver performance, and prevent breakdowns with maintenance signals.
        </p>
      </summary>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Start Location</label>
          <select
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">End Location</label>
          <select
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
          <select
            value={optimizeBy}
            onChange={(e) => setOptimizeBy(e.target.value as 'distance' | 'time')}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="distance">Shortest Distance</option>
            <option value="time">Fastest Time</option>
          </select>
        </div>
        <button
          onClick={handleOptimize}
          disabled={loading || start === end}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Suggest Route'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Suggested Route</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {result.path.map((node, i) => (
              <div key={node} className="flex items-center gap-2 whitespace-nowrap">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                  {node}
                </span>
                {i < result.path.length - 1 && (
                  <span className="text-slate-400">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Total {result.metricUsed === 'distance' ? 'Distance' : 'Time'}:
            <strong className="text-slate-900 ml-1">
              {result.totalMetric} {result.metricUsed === 'distance' ? 'km' : 'hours'}
            </strong>
          </p>
        </div>
      )}
    </details>
  )
}