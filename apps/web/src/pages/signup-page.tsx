import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, Sparkles, Truck, UserPlus } from 'lucide-react'
import { useAuth } from '../context/auth-context'

export function SignupPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  const passwordsMatch = form.password === form.confirmPassword
  const passwordStrong = form.password.length >= 8

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!passwordsMatch || !passwordStrong) return
    setError('')
    setIsSubmitting(true)
    try {
      await register(form.fullName, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_28%)]" />
      <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-up hidden rounded-[2rem] border border-white/70 bg-white/70 p-10 shadow-xl shadow-slate-900/5 backdrop-blur lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
              <Truck size={26} className="text-white" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Team onboarding</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-900">
              Give operators a professional, secure way to access fleet operations.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              Create role-ready accounts for dispatchers and operations managers with a simple onboarding flow and protected workspace access.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Role ready</p>
                <p className="mt-2 text-lg font-bold text-slate-900">Dispatch</p>
                <p className="mt-1 text-sm text-slate-500">Set up accounts for planners and route coordinators.</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Fast access</p>
                <p className="mt-2 text-lg font-bold text-slate-900">Instant</p>
                <p className="mt-1 text-sm text-slate-500">Successful registration signs the operator in immediately.</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Security</p>
                <p className="mt-2 text-lg font-bold text-slate-900">Guarded</p>
                <p className="mt-1 text-sm text-slate-500">Password strength and protected session flow by default.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={16} className="text-emerald-600" />
              Account checklist
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>Use a real operator email address</li>
              <li>Choose a password with at least 8 characters</li>
              <li>Accept terms to complete access setup</li>
            </ul>
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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-100">
            <Sparkles size={12} />
            Onboarding access
          </div>
          <div className="mb-6 text-center">
            <h2 className="font-display text-xl font-bold text-slate-900">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500">Join the fleet operations team</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
              <input
                className={inputCls}
                type="text"
                placeholder="Aarav Mehta"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                autoComplete="name"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email address</span>
              <input
                className={inputCls}
                type="email"
                placeholder="operator@haulsync.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              {/* Strength indicators */}
              {form.password.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                  {[1, 2, 3, 4].map((seg) => {
                    const strength =
                      form.password.length >= 12 ? 4 :
                      form.password.length >= 10 ? 3 :
                      form.password.length >= 8 ? 2 : 1
                    return (
                      <div
                        key={seg}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          seg <= strength
                            ? strength <= 1
                              ? 'bg-rose-500'
                              : strength <= 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    )
                  })}
                </div>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</span>
              <input
                className={`${inputCls} ${
                  form.confirmPassword.length > 0 && !passwordsMatch
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : ''
                }`}
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
              />
              {form.confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">Passwords do not match</p>
              )}
              {form.confirmPassword.length > 0 && passwordsMatch && passwordStrong && (
                <p className="mt-1.5 text-xs font-medium text-emerald-600">Passwords match</p>
              )}
            </label>

            <label className="flex items-start gap-2.5 pt-1 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/20"
                required
              />
              <span>
                I agree to the{' '}
                <a href="#" className="font-medium text-brand-600 hover:text-brand-700">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="font-medium text-brand-600 hover:text-brand-700">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !passwordsMatch || !passwordStrong || !agreed}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <UserPlus size={16} />
              )}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
              New accounts are signed in immediately after successful registration.
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Profile</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Identity</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Security</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Password</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm shadow-slate-900/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Access</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Workspace</p>
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
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
              Sign in
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
