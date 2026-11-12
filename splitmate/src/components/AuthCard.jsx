import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

// Shared shell for the login and register pages.
export default function AuthCard({ title, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 inline-block">
          <Logo />
        </Link>
        <div className="card">
          <h1 className="mb-6 text-xl text-ink">{title}</h1>
          {children}
        </div>
        {footer && <p className="mt-6 text-center text-sm text-ink-2">{footer}</p>}
      </div>
    </div>
  )
}
