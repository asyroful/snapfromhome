import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import Button from '../../components/ui/Button'
import useAdminStore from '../../stores/adminStore'
import { useAnalytics } from '../../hooks/useAnalytics'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export default function AdminLogin() {
  const login    = useAdminStore((s) => s.login)
  const navigate = useNavigate()
  const { trackAdminLogin } = useAnalytics()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    setError('')
    await sleep(400)
    const ok = login(username, password)
    setLoading(false)
    if (ok) { trackAdminLogin() }
    else    { setError('Invalid username or password.') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans text-slate-900">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-5 shadow-md">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
          <p className="text-slate-500 text-sm mt-1.5">SnapFromHome Control Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-7 flex flex-col gap-5">
          <div>
            <label htmlFor="admin-username" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all pr-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="!bg-slate-900 !text-white !border-slate-900 hover:!bg-slate-800 shadow-md"
            >
              Sign In
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mt-2"
          >
            ← Return to Booth
          </button>
        </form>
      </div>
    </div>
  )
}
