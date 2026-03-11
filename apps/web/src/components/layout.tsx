import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Activity, CarFront, ChevronDown, ClipboardList, LogOut, Menu, Route, ShieldCheck, Truck, Users, X } from 'lucide-react'
import { useAuth } from '../context/auth-context'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: Activity },
  { to: '/vehicles', label: 'Vehicles', icon: CarFront },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: ClipboardList },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'Vehicles',
  '/drivers': 'Drivers',
  '/trips': 'Trips',
  '/maintenance': 'Maintenance',
}

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const currentTitle = pageTitles[location.pathname] ?? 'Dashboard'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)

  const displayName = user?.name?.trim() || 'User'
  const displayEmail = user?.email || 'No email available'
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  function handleLogout() {
    setProfileOpen(false)
    logout()
    navigate('/login')
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top navigation ── */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
              <Truck size={18} className="text-white" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
              HaulSync
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </div>

            <div
              ref={profileRef}
              className="relative hidden sm:block"
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-1 pr-3 py-1 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                aria-label="Open account details"
                aria-expanded={profileOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {initials}
                </span>
                <span className="hidden text-left lg:block">
                  <span className="block text-sm font-semibold leading-tight text-slate-800">{displayName}</span>
                  <span className="block text-xs leading-tight text-slate-500">{displayEmail}</span>
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`absolute right-0 top-full z-40 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 transition-all duration-150 ${profileOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="truncate text-sm text-slate-500">{displayEmail}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Account</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Active session
                  </div>
                  {memberSince && (
                    <p className="mt-1 text-xs text-slate-500">Member since {memberSince}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white sm:hidden" title={displayName}>
              {initials}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:flex"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
            {/* Mobile menu button */}
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              <div className="mb-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-sm text-slate-500">{displayEmail}</p>
              </div>

              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => { setMobileOpen(false); handleLogout() }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-slate-900">{currentTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">Fleet management operations</p>
        </div>
        <Outlet />
      </main>
    </div>
  )
}