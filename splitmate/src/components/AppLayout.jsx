import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from './Logo.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import SignOutIcon from './SignOutIcon.jsx'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="navbar">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-6">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <div className="flex min-w-0 items-center gap-4 text-sm">
            <Link to="/move-groups" className="shrink-0 text-ink-3 transition-colors hover:text-ink">
              Move groups
            </Link>
            <span className="truncate text-ink-2">{user?.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="btn shrink-0 gap-1.5 border-ink-2 bg-surface px-3 py-1.5 text-ink hover:border-ink hover:bg-ink hover:text-white"
            >
              <SignOutIcon />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
