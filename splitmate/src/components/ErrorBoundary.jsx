import { Component } from 'react'
import { useLocation } from 'react-router-dom'

// If a page crashes, show what went wrong instead of a blank screen.
class Boundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="card py-12 text-center">
        <p className="text-sm text-ink">Something went wrong showing this page.</p>
        <p className="mt-2 text-xs text-ink-3">{String(this.state.error?.message ?? this.state.error)}</p>
        <a href="/dashboard" className="link mt-4 inline-block text-sm">
          Back to dashboard
        </a>
      </div>
    )
  }
}

// Keyed on the address so moving to another page clears the error.
export default function ErrorBoundary({ children }) {
  const { pathname } = useLocation()
  return <Boundary key={pathname}>{children}</Boundary>
}
