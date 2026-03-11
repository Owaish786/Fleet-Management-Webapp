import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, ShieldCheck, Truck } from 'lucide-react'

import { authApi } from '../lib/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400 transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await authApi.forgotPassword({ email })
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process password reset.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_28%)]" />
      <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-up hidden rounded-[2rem] border border-white/70 bg-white/70 p-10 shadow-xl shadow-slate-900/5 backdrop-blur lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
              <Truck size={26} className="text-white" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Account recovery</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-900">
              Keep operators moving even when credentials are misplaced.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              The current flow confirms reset requests inside the product and is ready to be rewired later to email delivery.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck size={16} className="text-emerald-600" />
              Recovery note
            </div>
            <p className="mt-3 text-sm text-slate-500">
              For now, reset instructions are simulated in-app. Later this can be wired to email or SMS.
            </p>
          </div>
        </div>

        <div className="animate-fade-up w-full max-w-md justify-self-center lg:max-w-none">
        <div className="mb-8 text-center lg:hidden">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/25">
            <Truck size={26} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            HaulSync
          </h1>
          <p className="mt-1 text-sm text-slate-500">Password recovery</p>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-xl shadow-slate-900/6 backdrop-blur">
          <div className="mb-6 text-center">
            <h2 className="font-display text-xl font-bold text-slate-900">Reset your password</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your email to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email address</span>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputCls} pl-10`}
                  type="email"
                  placeholder="admin@haulsync.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send reset instructions'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700">
              <ArrowLeft size={16} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}