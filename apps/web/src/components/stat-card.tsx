interface StatCardProps {
  label: string
  value: string | number
  detail: string
  accentClass?: string
  meta?: string
}

export function StatCard({
  label,
  value,
  detail,
  accentClass = 'from-brand-500/20 via-brand-100/60 to-transparent',
  meta,
}: StatCardProps) {
  return (
    <article className="animate-fade-up relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
      <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-r ${accentClass}`} />
      <div className="absolute right-5 top-5 h-14 w-14 rounded-full bg-white/70 blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {label}
          </span>
          {meta && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {meta}
            </span>
          )}
        </div>

        <strong className="mt-3 block text-4xl font-extrabold tracking-tight text-slate-900">
        {value}
        </strong>
        <p className="mt-2 max-w-[20ch] text-sm leading-6 text-slate-500">{detail}</p>
      </div>
    </article>
  )
}