import { Radar, Route, ShieldCheck, Truck, Users, Wrench } from 'lucide-react'

const proofCards = [
  {
    name: 'Aarav Mehta',
    role: 'Dispatch Lead',
    company: 'Western Freight Hub',
    quote: 'Route handovers are clearer, faster, and far less manual for our dispatch team.',
  },
  {
    name: 'Neha Kapoor',
    role: 'Fleet Operations',
    company: 'Northline Carriers',
    quote: 'Live tracking and assignment visibility give us a much cleaner operating rhythm.',
  },
  {
    name: 'Rohan Iyer',
    role: 'Transport Manager',
    company: 'BlueRoad Logistics',
    quote: 'We now catch downtime and routing pressure early instead of reacting late.',
  },
]

const signalCards = [
  { label: 'Tracking', value: 'Live', icon: Radar },
  { label: 'Trips', value: 'Coordinated', icon: Route },
  { label: 'Fleet', value: 'Ready', icon: Truck },
  { label: 'Drivers', value: 'Aligned', icon: Users },
]

export function LoadingScreen({ message = 'Preparing your fleet workspace...' }: { message?: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f9fc_0%,#eef4ff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-1/3 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/70 px-4 py-3 shadow-sm shadow-slate-900/5 backdrop-blur-xl sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
              <Truck size={22} className="text-white" />
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-slate-900">HaulSync India</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Fleet command workspace</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-500">Loading modules</div>
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">Secure boot</div>
          </div>
        </header>

        <main className="grid flex-1 gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10">
          <section className="flex flex-col justify-center">
            <div className="animate-fade-up inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700 ring-1 ring-brand-100">
              <ShieldCheck size={12} />
              Workspace loading
            </div>

            <h1 className="animate-fade-up mt-5 max-w-2xl font-display text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Bring fleet visibility online before the first route check-in.
            </h1>
            <p className="animate-fade-up delay-1 mt-5 max-w-xl text-lg leading-8 text-slate-600">
              {message} Dispatch data, vehicle status, route pressure, and driver readiness are being assembled into a single operating view.
            </p>

            <div className="animate-fade-up delay-2 mt-7 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Syncing live operations
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/85 px-5 py-3 text-sm font-medium text-slate-600 shadow-sm shadow-slate-900/5">
                Estimated wait: a few seconds
              </div>
            </div>

            <div className="animate-fade-up delay-3 mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {signalCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-[1.4rem] border border-white/80 bg-white/80 p-4 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <Icon size={16} className="text-slate-400" />
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-900">{value}</p>
                  <div className="loading-shimmer mt-3 h-2 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </section>

          <section className="animate-fade-up delay-2 rounded-[2rem] border border-white/75 bg-white/75 p-4 shadow-2xl shadow-slate-900/8 backdrop-blur-xl sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(145deg,rgba(79,70,229,0.08),rgba(14,165,233,0.04),rgba(255,255,255,0.9))] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">Command preview</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Operational overview loading</h2>
                  </div>
                  <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 ring-1 ring-slate-200">
                    Live sync
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm shadow-slate-900/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Fleet health</p>
                    <div className="loading-shimmer mt-3 h-10 rounded-2xl bg-slate-200" />
                    <div className="loading-shimmer mt-3 h-2 rounded-full bg-slate-200" />
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm shadow-slate-900/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Trip pressure</p>
                    <div className="loading-shimmer mt-3 h-10 rounded-2xl bg-slate-200" />
                    <div className="loading-shimmer mt-3 h-2 rounded-full bg-slate-200" />
                  </div>
                </div>

                <div className="mt-4 rounded-[1.6rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-lg shadow-slate-900/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Map layer</p>
                      <p className="mt-1 text-sm font-semibold text-white">Tracking surface</p>
                    </div>
                    <Radar size={18} className="text-cyan-300" />
                  </div>
                  <div className="relative mt-4 h-56 overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.3),transparent_18%),radial-gradient(circle_at_75%_35%,rgba(14,165,233,0.4),transparent_20%),radial-gradient(circle_at_58%_72%,rgba(99,102,241,0.35),transparent_18%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(30,41,59,0.98))]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:34px_34px]" />
                    <div className="absolute left-[18%] top-[28%] h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_0_8px_rgba(74,222,128,0.14)] animate-pulse" />
                    <div className="absolute left-[57%] top-[44%] h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_0_8px_rgba(34,211,238,0.14)] animate-pulse" />
                    <div className="absolute left-[74%] top-[64%] h-4 w-4 rounded-full bg-brand-400 shadow-[0_0_0_8px_rgba(129,140,248,0.14)] animate-pulse" />
                    <div className="absolute left-[22%] top-[31%] h-[2px] w-[42%] rotate-[10deg] bg-gradient-to-r from-emerald-300/80 to-cyan-300/0" />
                    <div className="absolute left-[58%] top-[47%] h-[2px] w-[18%] rotate-[32deg] bg-gradient-to-r from-cyan-300/80 to-brand-300/0" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50/90 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Loading checks</p>
                    <Wrench size={16} className="text-slate-400" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {['Authenticating operator', 'Fetching fleet summary', 'Warming tracking feed'].map((item) => (
                      <div key={item} className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm shadow-slate-900/5">
                        <div className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-sm font-medium text-slate-700">{item}</p>
                        </div>
                        <div className="loading-shimmer mt-3 h-2 rounded-full bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Dispatch note</p>
                  <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">A cleaner start for daily operations</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This loading state mirrors the product tone so the app feels intentional even before the workspace fully mounts.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <section className="pb-6">
          <div className="rounded-[2rem] border border-white/75 bg-white/75 p-5 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">What operators say</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">Confidence before the shift begins</h2>
              </div>
              <div className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 lg:block">
                Fleet UX preview
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {proofCards.map((card) => (
                <article key={card.name} className="rounded-[1.6rem] border border-slate-200 bg-slate-50/85 p-5 shadow-sm shadow-slate-900/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-cyan-100 text-sm font-bold text-brand-700">
                      {card.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{card.name}</p>
                      <p className="text-sm text-slate-500">{card.role}</p>
                      <p className="text-sm text-slate-400">{card.company}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-base leading-8 text-slate-600">“{card.quote}”</p>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-center justify-center rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(241,245,249,0.9))] px-6 py-8 text-center">
              <h3 className="font-display text-3xl font-black tracking-tight text-slate-950">Loading a sharper fleet workspace</h3>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                While the system syncs, we keep the screen informative and on-brand instead of dropping users into a blank wait state.
              </p>
              <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                Finalising workspace setup
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}