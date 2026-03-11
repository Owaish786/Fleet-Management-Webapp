import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LogIn, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { useAuth } from '../context/auth-context'

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  function fillDemoAccount() {
    setEmail('admin@haulsync.in')
    setPassword('password123')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-12 h-40 w-40 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-56 w-56 rounded-full bg-cyan-100 blur-3xl" />

      <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-fade-up hidden rounded-[2rem] border border-white/70 bg-white/70 p-10 shadow-xl shadow-slate-900/5 backdrop-blur lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
              <Truck size={26} className="text-white" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Fleet command</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-900">
              Keep dispatch, drivers, and maintenance in one secure workspace.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              Track fleet activity in real time, manage operations from a single dashboard, and keep your team aligned from route planning to workshop coverage.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Tracking</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Live</p>
                <p className="mt-1 text-sm text-slate-500">Map-first visibility for vehicles in motion.</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Dispatch</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Unified</p>
                <p className="mt-1 text-sm text-slate-500">Trips, drivers, and fleet readiness in one surface.</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Access</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Secure</p>
                <p className="mt-1 text-sm text-slate-500">Protected operator workspace with authenticated sessions.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Secure access</p>
              <p className="mt-1 text-sm text-slate-500">JWT sessions and protected fleet endpoints.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Ready to demo</p>
              <p className="mt-1 text-sm text-slate-500">Pre-seeded account for quick verification and review.</p>
            </div>
          </div>
        </div>

        <div className="animate-fade-up w-full max-w-md justify-self-center lg:max-w-none">
        <div className="mb-8 text-center lg:hidden">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/25">
            <Truck size={26} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            HaulSync India
          </h1>
          <p className="mt-1 text-sm text-slate-500">India Fleet Operations Platform</p>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-xl shadow-slate-900/6 backdrop-blur">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700 ring-1 ring-brand-100">
            <Sparkles size={12} />
            Operator login
          </div>
          <div className="mb-6 text-center">
            <h2 className="font-display text-xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to your operations console and resume fleet oversight.</p>
          </div>

          <div className="mb-5 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 px-4 py-4 text-sm text-brand-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Demo credentials</p>
                <p className="mt-1 text-brand-900/80">Email: admin@haulsync.in</p>
                <p className="text-brand-900/80">Password: password123</p>
              </div>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100 transition-colors hover:bg-brand-50"
              >
                Use demo
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email address</span>
              <input
                className={inputCls}
                type="email"
                placeholder="operator@haulsync.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
              <div className="relative">
                <input
                  className={`${inputCls} pr-11`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/20"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn size={16} />
              )}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              Protected workspace access for authenticated users only
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Step 1</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Authenticate</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Step 2</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Review fleet</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Step 3</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Dispatch actions</p>
              </div>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
              Create account
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} HaulSync India &middot; Fleet Management Platform
        </p>
      </div>
      </div>
    </div>
  )
}
