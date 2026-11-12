import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page text-sm text-ink-3">
      Loading…
    </div>
  )
}

// Only for signed-in users. Others go to /login and come back afterwards.
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

// Landing, login and register: signed-in users are sent to the dashboard.
export function PublicOnly() {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
