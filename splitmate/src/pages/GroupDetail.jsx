import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as storage from '../data/storage.js'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { computeNetBalances, settleDebts } from '../utils/balances.js'
import { formatMoney } from '../utils/money.js'
import { memberLabel, memberLabelByEmail } from '../utils/members.js'
import { categoryOf } from '../utils/categories.js'
import AddExpenseModal from '../components/AddExpenseModal.jsx'
import ExpenseDetailModal from '../components/ExpenseDetailModal.jsx'
import Avatar from '../components/Avatar.jsx'
import MemberBadge from '../components/MemberBadge.jsx'

async function loadGroup(groupId, userId) {
  const group = await storage.getGroup(groupId)
  // Only active members can see a group.
  if (!group || !group.members.some((m) => m.userId === userId && m.status === 'active')) {
    return null
  }
  const expenses = await storage.getExpenses(groupId)
  return { group, expenses }
}

function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function GroupDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useAsyncData(() => loadGroup(id, user.id), [id, user.id])
  const [showAdd, setShowAdd] = useState(false)
  const closeModal = useCallback(() => setShowAdd(false), [])
  const [viewing, setViewing] = useState(null)
  const closeDetail = useCallback(() => setViewing(null), [])

  if (loading) return <p className="text-sm text-ink-3">Loading…</p>
  if (error) return <p className="text-sm text-danger">Couldn’t load this group: {error.message}</p>
  if (!data) {
    return (
      <div className="card py-12 text-center">
        <p className="text-sm text-ink-3">
          This group doesn’t exist, or you’re not a member of it.
        </p>
        <Link to="/dashboard" className="link mt-3 inline-block text-sm">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const { group, expenses } = data
  const me = user.email
  const label = (email) => memberLabelByEmail(group.members, email, me)

  const sortedExpenses = [...expenses].sort(
    (a, b) =>
      (b.date ?? '').localeCompare(a.date ?? '') ||
      (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  )

  const net = computeNetBalances(
    group.members.map((m) => m.email),
    expenses,
  )
  const settlements = settleDebts(net)
  // Payments involving the current user come first.
  const mine = settlements.filter((s) => s.from === me || s.to === me)
  const others = settlements.filter((s) => s.from !== me && s.to !== me)

  const modalMembers = group.members.map((m) => ({
    email: m.email,
    label: memberLabel(m, me) + (m.status === 'pending' ? ' (pending)' : ''),
  }))

  async function handleAddExpense(expense) {
    await storage.addExpense({ ...expense, groupId: group.id, createdBy: user.id })
    setShowAdd(false)
    reload()
  }

  async function handleDelete(expense) {
    if (!window.confirm(`Delete “${expense.description}”?`)) return
    await storage.softDeleteExpense(expense.id, user.id)
    reload()
  }

  async function handleDeleteGroup() {
    const count = expenses.length
    const ok = window.confirm(
      `Delete the group “${group.name}”` +
        (count ? ` and its ${count} expense${count === 1 ? '' : 's'}` : '') +
        '? It will disappear for every member.',
    )
    if (!ok) return
    await storage.softDeleteGroup(group.id, user.id)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard" className="text-sm text-ink-2 transition-colors hover:text-ink">
          ← Back to dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="min-w-0 truncate text-xl text-ink">{group.name}</h1>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            Add expense
          </button>
        </div>
        <p className="mt-1 text-xs text-ink-3">
          {group.createdAt && `Created ${formatDate(group.createdAt)} · `}
          {expenses.length}{' '}
          {expenses.length === 1 ? 'expense' : 'expenses'}
        </p>
      </div>

      {/* Wide screens: expenses on the left, members and balances on the right.
          Narrow screens keep the order Members, Expenses, Balances. */}
      <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:grid-rows-[auto_1fr]">
      <section className="lg:col-start-2 lg:row-start-1">
        <h2 className="section-title">
          Members <span className="font-normal text-ink-3">{group.members.length}</span>
        </h2>
        <ul className="flex flex-wrap gap-2">
          {group.members.map((m) => (
            <li
              key={m.email}
              className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2 text-sm text-ink"
            >
              <Avatar name={m.name} email={m.email} />
              <span>{m.email === me ? `${m.name} (you)` : (m.name ?? m.email)}</span>
              <MemberBadge status={m.status} />
            </li>
          ))}
        </ul>
      </section>

      <section className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <h2 className="section-title">Expenses</h2>
        {sortedExpenses.length === 0 ? (
          <div className="card py-10 text-center text-sm text-ink-3">
            No expenses yet. Add the first one.
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedExpenses.map((e) => (
              <li
                key={e.id}
                className="card flex items-center gap-4 px-6 py-4 transition-colors hover:border-ink-3"
              >
                <button
                  type="button"
                  onClick={() => setViewing(e)}
                  className="-my-2 flex min-w-0 flex-1 items-center gap-4 rounded-md py-2 text-left"
                  aria-label={`See how ${e.description} is shared`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-base font-medium text-ink">{e.description}</p>
                      <span className="badge shrink-0 bg-settled-bg text-settled">
                        {categoryOf(e)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-3">
                      {label(e.paidBy)} paid · {formatDate(e.date)}
                    </p>
                  </div>
                  <p className="amount text-lg text-ink">{formatMoney(e.amount)}</p>
                  <span aria-hidden="true" className="text-ink-3">›</span>
                </button>
                <button
                  onClick={() => handleDelete(e)}
                  className="-mr-2 rounded-md px-2 py-1 text-xs text-ink-3 transition-colors hover:bg-neg-bg hover:text-danger"
                  aria-label={`Delete ${e.description}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="lg:col-start-2 lg:row-start-2">
        <h2 className="section-title">Balances</h2>
        {settlements.length === 0 ? (
          <div className="card py-10 text-center">
            <span className="pill pill-settled">All settled</span>
          </div>
        ) : (
          <div className="space-y-4">
            {mine.length > 0 && (
              <ul className="space-y-2">
                {mine.map((s) => {
                  const iOwe = s.from === me
                  return (
                    <li
                      key={`${s.from}-${s.to}`}
                      className={`flex items-center justify-between gap-4 rounded-xl px-5 py-4 ${
                        iOwe ? 'bg-neg-bg text-neg' : 'bg-pos-bg text-pos'
                      }`}
                    >
                      <span className="text-base font-semibold">
                        {iOwe ? `You owe ${label(s.to)}` : `${label(s.from)} owes you`}
                      </span>
                      <span className="amount text-2xl font-extrabold">
                        {formatMoney(s.amount)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
            {others.length > 0 && (
              <div className="card py-3">
                {mine.length > 0 && <p className="mb-1 text-xs text-ink-3">Between others</p>}
                <ul className="divide-y divide-line">
                  {others.map((s) => (
                    <li
                      key={`${s.from}-${s.to}`}
                      className="flex items-center justify-between gap-4 py-2 text-sm text-ink-2"
                    >
                      <span>
                        {label(s.from)} owes {label(s.to)}
                      </span>
                      <span className="amount">{formatMoney(s.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
      </div>

      <div className="border-t border-line pt-6">
        <button onClick={handleDeleteGroup} className="btn btn-danger">
          Delete group
        </button>
      </div>

      {viewing && (
        <ExpenseDetailModal
          expense={viewing}
          members={group.members}
          currentEmail={me}
          dateText={formatDate(viewing.date)}
          onClose={closeDetail}
        />
      )}

      {showAdd && (
        <AddExpenseModal
          members={modalMembers}
          currentEmail={me}
          onSave={handleAddExpense}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
