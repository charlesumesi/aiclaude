import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from './Logo.jsx'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-40 h-14 border-b border-line bg-surface">
        <div className="mx-auto flex h-full max-w-page items-center justify-between gap-4 px-4">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <div className="flex min-w-0 items-center gap-4 text-sm">
            <span className="truncate text-ink-2">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="shrink-0 text-ink-3 transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-page px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
