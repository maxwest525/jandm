import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useLogin } from '../../api/auth'
import { useTheme } from '../../store/Theme'

const DEMO_PASSWORD = 'tempo'
const ACCOUNTS = [
  { role: 'Owner', email: 'maya@tempo.dev', name: 'Maya Chen', color: '#7c74ff' },
  { role: 'Member', email: 'sam@tempo.dev', name: 'Sam Rivera', color: '#3bb2f6' },
  { role: 'Viewer', email: 'priya@tempo.dev', name: 'Priya Patel', color: '#f2913b' },
]

export function LoginView() {
  const login = useLogin()
  const { theme, toggle } = useTheme()
  const [email, setEmail] = useState('maya@tempo.dev')
  const [password, setPassword] = useState(DEMO_PASSWORD)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    login.mutate({ email, password })
  }

  const quick = (accEmail: string) => {
    setEmail(accEmail)
    setPassword(DEMO_PASSWORD)
    login.mutate({ email: accEmail, password: DEMO_PASSWORD })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg p-4">
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="absolute right-4 top-4 rounded-lg border border-border bg-surface p-2 text-muted hover:text-content"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-contrast">
            <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden>
              <rect x="7" y="8" width="7" height="16" rx="2" fill="currentColor" />
              <rect x="18" y="8" width="7" height="10" rx="2" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">Tempo</span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h1 className="text-base font-semibold text-content">Sign in</h1>
          <p className="mt-1 text-[13px] text-muted">Welcome back. Pick an account or sign in below.</p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <div>
              <label htmlFor="email" className="mb-1 block text-2xs font-semibold uppercase tracking-wider text-subtle">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-sm text-content outline-none focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-2xs font-semibold uppercase tracking-wider text-subtle">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-sm text-content outline-none focus:border-accent"
              />
            </div>

            {login.isError && (
              <p className="text-2xs font-medium text-red-400">
                {(login.error as Error)?.message ?? 'Sign in failed'}
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="h-10 w-full rounded-lg bg-accent text-sm font-medium text-accent-contrast transition-all hover:brightness-110 active:scale-[.99] disabled:opacity-60"
            >
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-subtle">Demo accounts</p>
            <div className="space-y-1.5">
              {ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => quick(a.email)}
                  disabled={login.isPending}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border px-2.5 py-2 text-left transition-colors hover:border-border-2 hover:bg-surface-2 disabled:opacity-60"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-2xs font-semibold text-white"
                    style={{ background: a.color }}
                  >
                    {a.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium text-content">{a.name}</span>
                    <span className="block text-2xs text-subtle">{a.email}</span>
                  </span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-medium text-muted">{a.role}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-2xs text-subtle">
              Password for every demo account is <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-content">tempo</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
