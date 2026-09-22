import { useState } from 'react'
import { login, USERS, type AuthUser } from '../lib/auth'

export default function Login({ onLogin }: { onLogin: (u: AuthUser) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const u = login(username, password)
    if (u) {
      setError('')
      onLogin(u)
    } else {
      setError('Invalid username or password')
    }
  }

  const fill = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setError('')
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black font-black text-sm">HS</div>
          <h1 className="mt-4 text-xl font-extrabold tracking-tight">HASHI SETU</h1>
          <p className="mt-1 text-xs text-neutral-500">Sign in to access the depot workspace</p>
        </div>

        <form onSubmit={submit} className="mt-6 rounded-xl border border-[#222] bg-[#0c0c0c] p-5 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-400">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. pragna"
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-[#2a2a2a] bg-black px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-[#2a2a2a] bg-black px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-white py-2.5 text-sm font-bold text-black hover:bg-neutral-200 transition-all active:scale-[0.98]"
          >
            Sign in
          </button>
        </form>

        <div className="mt-4 rounded-xl border border-[#222] bg-[#0c0c0c] p-4">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Demo logins — click to fill</p>
          <div className="mt-2 space-y-1.5">
            {USERS.map((u) => (
              <button
                key={u.username}
                type="button"
                onClick={() => fill(u.username, u.password)}
                className="w-full flex items-center justify-between rounded-lg border border-[#222] bg-black px-3 py-2 text-xs hover:border-white/40 transition-colors"
              >
                <span className="font-mono text-white">{u.username} <span className="text-neutral-600">/ {u.password}</span></span>
                <span className="text-neutral-500">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
