import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import SignInIcon from '../components/SignInIcon.jsx'

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
      <header className="navbar">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <Logo />
          <Link
            to="/login"
            className="btn gap-1.5 border-primary bg-surface px-3 py-1.5 text-primary hover:bg-primary hover:text-white"
          >
            <SignInIcon />
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="pb-12 pt-12 sm:pb-14 sm:pt-16">
          <h1 className="max-w-3xl text-2xl tracking-tight text-ink">
            Split shared costs without the awkward maths
          </h1>
          <p className="mt-6 max-w-3xl text-base text-ink-2">
            Splitmate keeps track of what your group spends and tells everyone exactly who owes
            whom.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
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

        <section className="grid gap-8 pb-12 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card px-6 py-7">
              <p className="text-xs text-ink-3 tabular-nums">0{i + 1}</p>
              <h2 className="mt-4 text-lg text-ink">{f.title}</h2>
              <p className="mt-3 text-sm text-ink-2">{f.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
