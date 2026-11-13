import Modal from './Modal.jsx'
import Avatar from './Avatar.jsx'
import { formatMoney } from '../utils/money.js'
import { memberLabel } from '../utils/members.js'

// Older expenses have no splitType; shares within 1p of each other were equal.
function wasSplitEqually(expense, splits) {
  if (expense.splitType) return expense.splitType === 'equal'
  const amounts = splits.map((s) => s.amount)
  return Math.max(...amounts) - Math.min(...amounts) <= 1
}

// Shows who paid for an expense and how it was shared out.
export default function ExpenseDetailModal({ expense, members, currentEmail, dateText, onClose }) {
  const splits = expense.splits ?? []
  const byEmail = new Map(members.map((m) => [m.email, m]))
  const label = (email) => {
    const m = byEmail.get(email)
    return m ? memberLabel(m, currentEmail) : email
  }

  // Group order first, then anyone in the split who has since left the group.
  const shareOf = new Map(splits.map((s) => [s.email, s.amount]))
  const order = [
    ...members.map((m) => m.email).filter((e) => shareOf.has(e)),
    ...splits.map((s) => s.email).filter((e) => !byEmail.has(e)),
  ]
  const notIncluded = members.filter((m) => !shareOf.has(m.email))

  const payer = expense.paidBy
  const payerLabel = label(payer)
  const payerInSentence = payer === currentEmail ? 'you' : payerLabel

  function owesText(email, amount) {
    if (email === payer) return `Paid the full ${formatMoney(expense.amount)}`
    if (email === currentEmail) return `You owe ${payerInSentence} ${formatMoney(amount)}`
    return `Owes ${payerInSentence} ${formatMoney(amount)}`
  }

  const equal = splits.length > 0 && wasSplitEqually(expense, splits)

  return (
    <Modal title={expense.description} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <p className="amount text-3xl font-extrabold text-ink">{formatMoney(expense.amount)}</p>
          <p className="mt-1 text-sm text-ink-2">
            {payerLabel} paid{dateText && ` · ${dateText}`}
          </p>
        </div>

        <div>
          <p className="label">
            {equal
              ? `Split equally between ${splits.length} ${splits.length === 1 ? 'person' : 'people'}`
              : 'Split by custom amounts'}
          </p>
          {splits.length === 0 ? (
            <p className="text-sm text-ink-3">No split was recorded for this expense.</p>
          ) : (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {order.map((email) => {
                const amount = shareOf.get(email)
                const m = byEmail.get(email)
                const pct = expense.amount ? Math.round((amount / expense.amount) * 100) : 0
                return (
                  <li key={email} className="flex items-center gap-3 px-3.5 py-3">
                    <Avatar name={m?.name} email={email} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{label(email)}</p>
                      <p className="text-xs text-ink-3">{owesText(email, amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="amount text-sm font-semibold text-ink">{formatMoney(amount)}</p>
                      <p className="text-xs text-ink-3">{pct}%</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {notIncluded.length > 0 && (
          <p className="text-xs text-ink-3">
            Not included: {notIncluded.map((m) => memberLabel(m, currentEmail)).join(', ')}
          </p>
        )}

        <div className="flex justify-end border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
