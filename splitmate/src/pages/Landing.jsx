import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

const FEATURES = [
  {
    title: 'Create groups',
    body: 'Set up a group for a trip, a flat or a night out and invite people by email.',
  },
  {
    title: 'Track shared expenses',
    body: 'Log who paid and who shared it. Splitmate works out everyone’s share.',
  },
  {
    title: 'See who owes what',
    body: 'Balances settle in the fewest payments possible, so nobody sends money in circles.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-page">
      <header className="mx-auto flex h-14 max-w-page items-center justify-between px-4">
        <Logo />
        <Link to="/login" className="link text-sm">
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-page px-4">
        <section className="pb-12 pt-16 sm:pt-24">
          <h1 className="max-w-md text-2xl tracking-tight text-ink">
            Split shared costs without the awkward maths
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-2">
            Splitmate keeps track of what your group spends and tells everyone exactly who owes
            whom.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link to="/register" className="btn btn-primary">
              Get started
            </Link>
            <p className="text-sm text-ink-2">
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="grid gap-2 pb-24 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card">
              <p className="text-xs text-ink-3 tabular-nums">0{i + 1}</p>
              <h2 className="mt-3 text-lg text-ink">{f.title}</h2>
              <p className="mt-1 text-sm text-ink-2">{f.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
