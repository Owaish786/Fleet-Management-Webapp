/** Returns Tailwind classes for a status badge based on the status string. */
export function statusBadgeClass(status: string): string {
  const s = status.toLowerCase()
  if (s === 'active' || s === 'available' || s === 'completed') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
  }
  if (
    s === 'maintenance' ||
    s === 'in_progress' ||
    s === 'on_route' ||
    s === 'scheduled'
  ) {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
  }
  // idle, off_duty, etc.
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'
}
