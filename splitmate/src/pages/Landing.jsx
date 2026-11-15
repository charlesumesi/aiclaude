import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import SignInIcon from '../components/SignInIcon.jsx'
import Avatar from '../components/Avatar.jsx'
import { formatMoney, splitEqually } from '../utils/money.js'
import { computeNetBalances, settleDebts } from '../utils/balances.js'

// ---------- Sample group, run through the real balance code ----------
// Synthetic demo data. It is labelled "Sample group" wherever it appears.

const PEOPLE = {
  maya: 'Maya Patel',
  tom: 'Tom Hughes',
  priya: 'Priya Shah',
  josh: 'Josh Okafor',
}
const MEMBERS = Object.keys(PEOPLE)
const first = (key) => PEOPLE[key].split(' ')[0]

const SAMPLE = [
  { description: 'Airbnb, 3 nights', amount: 54000, paidBy: 'maya', category: 'Accommodation', date: '12 Apr' },
  { description: 'Airport train', amount: 4680, paidBy: 'maya', category: 'Transport', date: '12 Apr' },
  { description: 'Tapas and drinks', amount: 7140, paidBy: 'priya', category: 'Food & Drinks', date: '12 Apr' },
  { description: 'Saturday dinner', amount: 13260, paidBy: 'tom', category: 'Food & Drinks', date: '13 Apr' },
  { description: 'Sagrada Família tickets', amount: 10400, paidBy: 'josh', category: 'Activities', date: '14 Apr' },
].map((e) => ({
  ...e,
  splits: splitEqually(e.amount, MEMBERS).map(({ key, amount }) => ({ email: key, amount })),
}))

const SAMPLE_TOTAL = SAMPLE.reduce((sum, e) => sum + e.amount, 0)
const PAYMENTS = settleDebts(computeNetBalances(MEMBERS, SAMPLE))

// ---------- Small pieces ----------

function ChatMessage({ who, text, mine = false, delay }) {
  return (
    <div
      className={`chat-in flex items-end gap-2.5 ${mine ? 'flex-row-reverse self-end' : ''}`}
      style={{ '--delay': `${delay}ms` }}
    >
      <Avatar name={PEOPLE[who]} />
      <div>
        <span className="sr-only">{first(who)}: </span>
        <p
          className={`max-w-[min(18rem,70vw)] rounded-2xl border px-3.5 py-2 text-sm text-ink ${
            mine ? 'rounded-br-md bg-surface' : 'rounded-bl-md bg-surface'
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

function Payment({ from, to, amount, size = 'base' }) {
  return (
    <li className="flex items-center justify-between gap-4 py-2">
      <span className="flex items-center gap-2 text-sm text-ink">
        <Avatar name={PEOPLE[from]} />
        <span>
          {first(from)} pays <span className="font-semibold">{first(to)}</span>
        </span>
      </span>
      <span className={`amount text-ink ${size === 'lg' ? 'text-lg' : 'text-base'}`}>
        {formatMoney(amount)}
      </span>
    </li>
  )
}

function SplitmateAnswer() {
  return (
    <div className="chat-in rounded-xl border border-ink bg-surface p-5 [--delay:1500ms]">
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="text-logo-red">Split</span>
          <span className="-ml-2">mate</span>
          <span className="text-ink-3">·</span>
          Barcelona trip
        </p>
        <span className="badge bg-settled-bg text-settled">Sample group</span>
      </div>
      <p className="mt-3 text-xs text-ink-2">
        {SAMPLE.length} expenses · <span className="amount">{formatMoney(SAMPLE_TOTAL)}</span> ·
        split four ways
      </p>
      <ul className="mt-1 divide-y divide-line">
        {PAYMENTS.map((p) => (
          <Payment key={p.from + p.to} {...p} size="lg" />
        ))}
      </ul>
      <p className="mt-2 text-sm font-semibold text-ink">
        {PAYMENTS.length} payments and everyone’s square.
      </p>
    </div>
  )
}

const STEPS = [
  {
    title: 'Start a group',
    body: 'Name it and add people by email. Anyone who hasn’t signed up yet joins as pending.',
    demo: (
      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-ink">Flat 4B</p>
        {[
          ['Maya Patel', 'active'],
          ['Tom Hughes', 'active'],
          ['josh@example.com', 'pending'],
        ].map(([name, status]) => (
          <div key={name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
              <Avatar name={status === 'active' ? name : undefined} email={name} />
              <span className="truncate">{name}</span>
            </span>
            <span className={`badge badge-${status}`}>{status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Add what you spend',
    body: 'Who paid, how much, and who it was for. Split it equally or set each share yourself.',
    demo: (
      <div>
        <p className="text-sm font-semibold text-ink">Big shop</p>
        <p className="text-xs text-ink-2">Food &amp; Drinks · Paid by Tom</p>
        <p className="mt-3 border-t border-line pt-3 text-sm text-ink-2">
          Shared equally by <span className="font-medium text-ink">Maya, Tom, Priya and Josh</span>.
          Everyone’s share is worked out for you.
        </p>
      </div>
    ),
  },
  {
    title: 'Settle up',
    body: 'Splitmate works out the fewest payments that clear every debt. Pay them however you like.',
    demo: (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink">You and Maya</span>
          <span className="pill pill-neg">You owe Maya</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink">You and Priya</span>
          <span className="pill pill-pos">Priya owes you</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink">You and Josh</span>
          <span className="pill pill-settled">All settled</span>
        </div>
      </div>
    ),
  },
]

function PhoneSketch() {
  return (
    <div className="relative mx-auto h-40 w-24 overflow-hidden rounded-[18px] border-2 border-ink bg-page" aria-hidden>
      <div className="mx-auto mt-1.5 h-1 w-8 rounded-full bg-line" />
      <div className="mx-2 mt-3 space-y-1.5">
        <div className="h-1.5 w-12 rounded-full bg-ink-3/50" />
        <div className="h-1.5 w-16 rounded-full bg-ink-3/30" />
      </div>
      <div className="absolute inset-x-0 bottom-0 rounded-t-xl border-t border-line bg-surface px-2 pb-2 pt-2">
        <div className="h-1.5 w-10 rounded-full bg-ink/70" />
        <div className="mt-2 h-4 rounded border border-line" />
        <div className="mt-1.5 h-4 rounded border border-line" />
        <div className="mt-2 h-4 rounded bg-primary" />
      </div>
    </div>
  )
}

const FEATURES = [
  {
    title: 'Invite people before they’ve joined',
    body: 'Add a flatmate by email today. Their share is tracked from the first expense, and the group appears for them the moment they register.',
    demo: (
      <div className="flex items-center gap-3 text-sm">
        <span className="badge badge-pending">pending</span>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden className="text-ink-3">
          <path d="M1 6h17M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="badge badge-active">active</span>
      </div>
    ),
  },
  {
    title: 'No money sent round in circles',
    body: 'Instead of everyone paying everyone back, Splitmate nets it all out. For groups up to 15 people it finds the true minimum number of payments.',
    demo: (
      <p className="text-sm text-ink-2">
        <span className="line-through decoration-ink-3">A web of IOUs</span> →{' '}
        <span className="font-semibold text-ink">a few simple payments</span>
      </p>
    ),
  },
  {
    title: 'Every expense on the record',
    body: 'Each expense keeps who paid, when, what it was for and how it was split, so “what was that one for?” always has an answer.',
    demo: (
      <ul className="w-full max-w-64 space-y-1.5 text-xs">
        {SAMPLE.slice(0, 2).map((e) => (
          <li key={e.description} className="flex justify-between gap-3">
            <span className="text-ink">{e.description}</span>
            <span className="text-ink-2">paid by {first(e.paidBy)}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: 'Made for the phone in your hand',
    body: 'Splitmate works in any mobile browser. Add the bill at the table and it opens as a sheet under your thumb, with no app to install.',
    demo: <PhoneSketch />,
  },
]

// ---------- Page ----------

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

      <main>
        {/* Hero: the group chat, answered */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-12 lg:pt-10">
          <div>
            <h1 className="text-display text-balance text-ink">
              End the “who paid for what?” thread.
            </h1>
            <p className="mt-5 max-w-lg text-lg font-normal text-ink-2">
              Log shared costs as they happen. Splitmate works out everyone’s share to the penny,
              and the fewest payments to square up.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link to="/register" className="btn btn-primary px-6 py-3 text-base">
                Get started
              </Link>
              <p className="text-sm text-ink-2">
                Already in a group?{' '}
                <Link to="/login" className="link">
                  Sign in
                </Link>
              </p>
            </div>
            <p className="mt-8 text-sm text-ink-2">For flatmates, friend groups and trips away.</p>
          </div>

          <div className="flex flex-col gap-2.5" aria-label="Example: a group chat about who paid, answered by Splitmate">
            <ChatMessage who="josh" delay={0} text="wait who paid for the airbnb in the end" />
            <ChatMessage who="maya" mine delay={350} text="me. and the airport train" />
            <ChatMessage who="tom" delay={700} text="I got dinner Saturday so are we even??" />
            <ChatMessage who="priya" delay={1050} text="someone please make a spreadsheet" />
            <SplitmateAnswer />
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl text-ink">Three steps, then nobody has to do the maths</h2>
              <p className="max-w-sm text-sm text-ink-2">
                Set it up once at the start of the trip or the tenancy. It keeps up from there.
              </p>
            </div>
            <ol className="mt-10 grid overflow-hidden rounded-xl border border-line md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="flex flex-col border-line bg-page p-6 not-first:border-t md:not-first:border-l md:not-first:border-t-0"
                >
                  <p className="flex items-center gap-3 text-sm font-semibold text-ink">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink text-xs">
                      {i + 1}
                    </span>
                    {s.title}
                  </p>
                  <p className="mt-3 text-sm text-ink-2">{s.body}</p>
                  <div className="mt-6 flex-1 rounded-lg border border-line bg-surface p-4">{s.demo}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <h2 className="text-2xl text-ink lg:sticky lg:top-24">
              Built for how groups actually spend
            </h2>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {FEATURES.map((f) => (
              <li key={f.title} className="grid items-center gap-5 py-7 sm:grid-cols-[1fr_220px] sm:gap-10">
                <div>
                  <h3 className="text-lg text-ink">{f.title}</h3>
                  <p className="mt-2 max-w-prose text-sm text-ink-2">{f.body}</p>
                </div>
                <div className="flex sm:justify-center">{f.demo}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Proof: checkable facts, not testimonials */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-2xl text-ink">Exact, not roughly</h2>
            <dl className="mt-10 divide-y divide-line border-y border-line">
              {[
                [
                  'Every penny accounted for',
                  'Everyone’s shares always add up to exactly what was spent. Nothing goes missing and nothing gets rounded away.',
                ],
                [
                  'Always the fewest payments',
                  'However many expenses pile up, Splitmate finds the shortest way for the group to square up.',
                ],
                [
                  'No ads, no upsells',
                  'It answers one question, who owes whom, and gets out of the way.',
                ],
              ].map(([fact, why]) => (
                <div key={fact}className="grid gap-2 py-6 md:grid-cols-[1.2fr_1fr] md:items-baseline md:gap-12">
                  <dt className="amount text-xl text-ink">{fact}</dt>
                  <dd className="max-w-md text-sm text-ink-2">{why}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Closing action */}
        <section className="bg-ink">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl text-white">Set up the group before the trip, not after it.</h2>
              <p className="mt-3 text-base text-ink-3">It takes a minute. Your group can join whenever they like.</p>
            </div>
            <Link to="/register" className="btn btn-primary px-6 py-3 text-base focus-visible:outline-white">
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
        <Logo />
        <p className="text-sm text-ink-2">Shared costs for flats, trips and nights out.</p>
      </footer>
    </div>
  )
}
