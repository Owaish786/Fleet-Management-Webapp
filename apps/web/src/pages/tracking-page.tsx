import { useEffect, useMemo, useState } from 'react'
import { Battery, Gauge, MapPinned, Radar, RefreshCcw, Smartphone } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { io } from 'socket.io-client'
import L from 'leaflet'

import { fleetApi } from '../lib/api'
import { formatTime } from '../lib/formatters'
import { statusBadgeClass } from '../lib/status-styles'
import type { LiveTrackingPoint } from '../types/fleet'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
const SOCKET_URL = API_URL.replace(/\/api$/, '')

const vehicleIcon = new L.DivIcon({
  className: 'tracking-marker',
  html: '<div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-brand-600 text-white shadow-lg shadow-brand-600/25"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4"/><path d="M5 8h14l1 5v5h-2a2 2 0 0 1-4 0H10a2 2 0 0 1-4 0H4v-5Z"/><path d="M6 8 8 4h8l2 4"/></svg></div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
})

export function TrackingPage() {
  const [points, setPoints] = useState<LiveTrackingPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    async function loadTracking() {
      try {
        setError(null)
        const latest = await fleetApi.getLatestTracking()
        setPoints(latest)
        setLastSync(new Date())
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load live tracking.')
      }
    }

    void loadTracking()

    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socket.on('tracking:update', (incoming: LiveTrackingPoint) => {
      setPoints((current) => {
        const next = current.filter((point) => point.vehicle.id !== incoming.vehicle.id)
        return [incoming, ...next]
      })
      setLastSync(new Date())
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const mapCenter = useMemo<[number, number]>(() => {
    if (points.length === 0) return [22.5937, 78.9629]
    return [points[0].latitude, points[0].longitude]
  }, [points])

  const movingCount = points.filter((point) => (point.speedKph ?? 0) > 5).length
  const avgSpeed = points.length
    ? Math.round(points.reduce((sum, point) => sum + (point.speedKph ?? 0), 0) / points.length)
    : 0

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="animate-fade-up overflow-hidden rounded-[1.85rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),_transparent_28%)]" />
            <div className="relative">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Live tracking</p>
              <h2 className="font-display text-2xl font-bold leading-tight text-slate-900">Monitor active vehicles through driver-phone GPS updates in near real time.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                This page is ready to consume pings from the future mobile app. Right now it is powered by seeded location points and live socket updates.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tracked vehicles</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{points.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Currently moving</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{movingCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm shadow-slate-900/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Average speed</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{avgSpeed} kph</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Socket status</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Live</p>
                <p className="mt-1 text-sm text-slate-500">WebSocket broadcast channel ready for incoming mobile pings.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Last sync</p>
                <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">{lastSync ? formatTime(lastSync) : 'Waiting'}</p>
                <p className="mt-1 text-sm text-slate-500">Refreshes automatically when new GPS points arrive.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="xl:col-span-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {error}
        </div>
      )}

      <section className="animate-fade-up rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4 px-2 pt-2">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Operations map</p>
            <h3 className="font-display text-xl font-bold text-slate-900">Active fleet positions</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">OpenStreetMap</span>
        </div>

        <div className="h-[560px] overflow-hidden rounded-[1.5rem] border border-slate-200">
          <MapContainer center={mapCenter} zoom={7} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((point) => (
              <Marker key={point.id} position={[point.latitude, point.longitude]} icon={vehicleIcon}>
                <Popup>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-semibold text-slate-900">{point.vehicle.plateNumber}</p>
                    <p>{point.vehicle.make} {point.vehicle.model}</p>
                    <p>Driver: {point.driver?.name ?? 'Unassigned'}</p>
                    <p>Trip: {point.trip?.routeName ?? 'No active trip'}</p>
                    <p>Speed: {point.speedKph ?? 0} kph</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      <section className="animate-fade-up rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Vehicle feed</p>
            <h3 className="font-display text-xl font-bold text-slate-900">Latest device locations</h3>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                const latest = await fleetApi.getLatestTracking()
                setPoints(latest)
                setError(null)
                setLastSync(new Date())
              } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Unable to refresh live tracking.')
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition-colors hover:bg-slate-200"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {points.map((point) => (
            <article key={point.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{point.vehicle.plateNumber}</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(point.vehicle.status)}`}>
                      {point.vehicle.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{point.vehicle.make} {point.vehicle.model}</p>
                  <p className="text-sm text-slate-500">{point.driver?.name ?? 'No driver linked'}</p>
                </div>
                <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 ring-1 ring-slate-200">
                  {point.ageSeconds < 120 ? 'Fresh' : `${Math.round(point.ageSeconds / 60)} min ago`}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><MapPinned size={15} /> Coordinates</div>
                  <p className="mt-1 text-sm text-slate-500">{point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Gauge size={15} /> Speed</div>
                  <p className="mt-1 text-sm text-slate-500">{point.speedKph ?? 0} kph</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Radar size={15} /> Accuracy</div>
                  <p className="mt-1 text-sm text-slate-500">{point.accuracyM ?? 'Unknown'} m</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Battery size={15} /> Device battery</div>
                  <p className="mt-1 text-sm text-slate-500">{point.batteryLevel ?? 'Unknown'}%</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-white px-3 py-3 ring-1 ring-slate-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Smartphone size={15} /> Driver phone feed</div>
                <p className="mt-1 text-sm text-slate-500">
                  Mobile integration target: the driver app will post GPS pings to <span className="font-mono text-xs">/api/tracking/ping</span> and this page will update automatically.
                </p>
              </div>
            </article>
          ))}

          {points.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No live vehicle locations yet.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}