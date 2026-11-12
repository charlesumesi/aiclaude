import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as storage from '../data/storage.js'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { computeNetBalances } from '../utils/balances.js'
import { formatMoney } from '../utils/money.js'
import Avatar from '../components/Avatar.jsx'

async function loadDashboard(user) {
  const groups = await storage.getGroupsForUser(user.id)
  const withBalances = await Promise.all(
    groups.map(async (group) => {
      const expenses = await storage.getExpenses(group.id)
      const net = computeNetBalances(
        group.members.map((m) => m.email),
        expenses,
      )
      return { ...group, myBalance: net.get(user.email) ?? 0 }
    }),
  )
  return withBalances.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// Pill states what the number means; the number itself is the big figure next to it.
function GroupBalance({ amount }) {
  if (amount === 0) return <span className="pill pill-settled">All settled</span>
  const owed = amount > 0
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className={`pill ${owed ? 'pill-pos' : 'pill-neg'}`}>
        {owed ? 'You’re owed' : 'You owe'}
      </span>
      <span className={`amount text-xl font-extrabold ${owed ? 'text-pos' : 'text-neg'}`}>
        {formatMoney(amount)}
      </span>
    </div>
  )
}

function SummaryCard({ label, amount, tone, prefix = '' }) {
  const colour = { pos: 'text-pos', neg: 'text-neg', none: 'text-ink' }[tone]
  return (
    <div className="card">
      <p className="text-xs text-ink-2">{label}</p>
      <p className={`amount mt-2 text-2xl font-extrabold ${colour}`}>
        {prefix}
        {formatMoney(amount)}
      </p>
    </div>
  )
}

function MemberStack({ members }) {
  const shown = members.slice(0, 4)
  return (
    <span className="flex -space-x-1.5">
      {shown.map((m) => (
        <Avatar key={m.email} name={m.name} email={m.email} className="ring-2 ring-surface" />
      ))}
    </span>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: groups, loading, error } = useAsyncData(() => loadDashboard(user), [user.id])

  if (loading) return <p className="text-sm text-ink-3">Loading…</p>
  if (error) return <p className="text-sm text-danger">Couldn’t load your groups: {error.message}</p>

  const youOwe = groups.reduce((t, g) => t + Math.min(g.myBalance, 0), 0)
  const owedToYou = groups.reduce((t, g) => t + Math.max(g.myBalance, 0), 0)
  const net = owedToYou + youOwe

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl text-ink">Hi, {user.name}</h1>
        {groups.length > 0 && (
          <Link to="/group/new" className="btn btn-primary">
            Create group
          </Link>
        )}
      </div>

      <section className="grid gap-2 sm:grid-cols-3">
        <SummaryCard label="Total you owe" amount={youOwe} tone={youOwe < 0 ? 'neg' : 'none'} />
        <SummaryCard
          label="Total owed to you"
          amount={owedToYou}
          tone={owedToYou > 0 ? 'pos' : 'none'}
        />
        <SummaryCard
          label="Net balance"
          amount={net}
          prefix={net < 0 ? '−' : net > 0 ? '+' : ''}
          tone={net > 0 ? 'pos' : net < 0 ? 'neg' : 'none'}
        />
      </section>

      <section>
        <h2 className="section-title">Your groups</h2>
        {groups.length === 0 ? (
          <div className="card py-12 text-center">
            <p className="text-sm text-ink-3">You’re not in any groups yet.</p>
            <Link to="/group/new" className="btn btn-primary mt-5">
              Create group
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {groups.map((g) => (
              <li key={g.id}>
                <Link
                  to={`/group/${g.id}`}
                  className="card flex items-center justify-between gap-4 transition-colors hover:border-ink-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-lg text-ink">{g.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <MemberStack members={g.members} />
                      <span className="text-sm text-ink-2">
                        {g.members.length} {g.members.length === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>
                  <GroupBalance amount={g.myBalance} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
