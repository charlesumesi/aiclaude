import { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import { formatMoney, parseAmount, penceToInput, splitEqually } from '../utils/money.js'
import { CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories.js'

function todayISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// members: [{ email, label }] — label is the display name ("You", "Bob", or an email)
export default function AddExpenseModal({ members, currentEmail, onSave, onClose }) {
  const [description, setDescription] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [date, setDate] = useState(todayISO)
  const [paidBy, setPaidBy] = useState(currentEmail)
  const [category, setCategory] = useState(DEFAULT_CATEGORY)
  const [sharedBy, setSharedBy] = useState(() => new Set(members.map((m) => m.email)))
  const [splitMode, setSplitMode] = useState('equal') // 'equal' | 'manual'
  // Raw text per member in manual mode, so half-typed values like "12." aren't reformatted.
  const [manualInputs, setManualInputs] = useState({})
  const [manualEdited, setManualEdited] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const amount = parseAmount(amountInput)

  // Keep the split in member order so leftover pennies land predictably.
  const sharers = members.filter((m) => sharedBy.has(m.email)).map((m) => m.email)
  const shares = useMemo(
    () => new Map(splitEqually(amount ?? 0, sharers).map((s) => [s.key, s.amount])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amount, sharers.join('|')],
  )

  // Manual mode: blank counts as £0, anything else must parse.
  const manual = members.map((m) => {
    const raw = manualInputs[m.email] ?? ''
    const blank = raw.trim() === ''
    const value = blank ? 0 : parseAmount(raw, { allowZero: true })
    return { ...m, raw, blank, value: value ?? 0, invalid: !blank && value === null }
  })
  const assigned = manual.reduce((sum, m) => sum + m.value, 0)
  const remaining = (amount ?? 0) - assigned
  const blankMembers = manual.filter((m) => m.value === 0 && !m.invalid)

  function toggle(email) {
    setSharedBy((prev) => {
      const next = new Set(prev)
      if (next.has(email)) next.delete(email)
      else next.add(email)
      return next
    })
  }

  function setManualInput(email, value) {
    setManualInputs((prev) => ({ ...prev, [email]: value }))
    setManualEdited(true)
  }

  function switchMode(mode) {
    if (mode === splitMode) return
    setError('')

    if (mode === 'manual') {
      // Start from the current equal split so the form is valid straight away.
      const prefill = {}
      for (const m of members) {
        const share = sharedBy.has(m.email) ? (shares.get(m.email) ?? 0) : 0
        prefill[m.email] = share > 0 ? penceToInput(share) : ''
      }
      setManualInputs(prefill)
      setManualEdited(false)
    } else {
      if (manualEdited && !window.confirm('Your custom amounts will be replaced by an equal split.')) {
        return
      }
      // Whoever had an amount becomes who shares it.
      const withAmount = manual.filter((m) => m.value > 0).map((m) => m.email)
      if (withAmount.length) setSharedBy(new Set(withAmount))
    }
    setSplitMode(mode)
  }

  // Spread what's left over the people who don't have an amount yet.
  function splitRemaining() {
    if (remaining <= 0 || !blankMembers.length) return
    const parts = splitEqually(
      remaining,
      blankMembers.map((m) => m.email),
    )
    setManualInputs((prev) => {
      const next = { ...prev }
      for (const p of parts) next[p.key] = p.amount > 0 ? penceToInput(p.amount) : ''
      return next
    })
    setManualEdited(true)
  }

  function buildSplits() {
    if (splitMode === 'equal') {
      if (sharers.length === 0) throw new Error('Pick at least one person to share it')
      // Tiny totals can leave someone with 0p; they don't need a split.
      return sharers
        .map((email) => ({ email, amount: shares.get(email) }))
        .filter((s) => s.amount > 0)
    }

    const bad = manual.find((m) => m.invalid)
    if (bad) throw new Error(`Check the amount for ${bad.label}`)
    const splits = manual
      .filter((m) => m.value > 0)
      .map((m) => ({ email: m.email, amount: m.value }))
    if (splits.length === 0) throw new Error('Give at least one person an amount')
    if (assigned !== amount) {
      throw new Error(
        `The amounts add up to ${formatMoney(assigned)} but the total is ${formatMoney(amount)}`,
      )
    }
    return splits
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return setError('Please say what the expense was for')
    if (!amount) return setError('Please enter an amount greater than £0')
    if (!date) return setError('Please pick a date')

    let splits
    try {
      splits = buildSplits()
    } catch (err) {
      return setError(err.message)
    }

    setSaving(true)
    try {
      await onSave({
        description: description.trim(),
        amount,
        date,
        paidBy,
        category,
        splitType: splitMode,
        splits,
      })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title="Add expense" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="exp-desc">
            What was it for?
          </label>
          <input
            id="exp-desc"
            autoFocus
            className="input"
            placeholder="e.g. Dinner at Dishoom"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="exp-amount">
              Total amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-ink-3">
                £
              </span>
              <input
                id="exp-amount"
                inputMode="decimal"
                className="input pl-7 tabular-nums"
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="exp-date">
              Date
            </label>
            <input
              id="exp-date"
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="exp-paid">
              Who paid?
            </label>
            <select
              id="exp-paid"
              className="input"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              {members.map((m) => (
                <option key={m.email} value={m.email}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="exp-category">
              Category
            </label>
            <select
              id="exp-category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="label flex w-full items-center justify-between">
            Who shares it?
            <span
              role="group"
              aria-label="How to split"
              className="inline-flex rounded-lg border border-line p-0.5 text-xs font-normal"
            >
              {[
                ['equal', 'Equally'],
                ['manual', 'Custom amounts'],
              ].map(([mode, text]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={splitMode === mode}
                  onClick={() => switchMode(mode)}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    splitMode === mode ? 'bg-primary text-white' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  {text}
                </button>
              ))}
            </span>
          </legend>

          {splitMode === 'equal' ? (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {members.map((m) => {
                const checked = sharedBy.has(m.email)
                return (
                  <li key={m.email}>
                    <label className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-page">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={checked}
                        onChange={() => toggle(m.email)}
                      />
                      <span
                        className={`flex-1 truncate text-sm ${checked ? 'text-ink' : 'text-ink-3'}`}
                      >
                        {m.label}
                      </span>
                      <span className={`amount text-sm ${checked ? 'text-ink' : 'text-ink-3'}`}>
                        {checked ? formatMoney(shares.get(m.email) ?? 0) : '—'}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          ) : (
            <>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {manual.map((m) => (
                  <li key={m.email} className="flex items-center gap-3 px-3.5 py-2">
                    <label
                      htmlFor={`share-${m.email}`}
                      className={`flex-1 truncate text-sm ${m.value > 0 ? 'text-ink' : 'text-ink-3'}`}
                    >
                      {m.label}
                    </label>
                    <div className="relative w-28">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink-3">
                        £
                      </span>
                      <input
                        id={`share-${m.email}`}
                        inputMode="decimal"
                        placeholder="0.00"
                        aria-invalid={m.invalid}
                        className={`input py-1.5 pl-6 text-right tabular-nums ${
                          m.invalid ? 'border-danger' : ''
                        }`}
                        value={m.raw}
                        onChange={(e) => setManualInput(m.email, e.target.value)}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex items-center justify-between gap-3 text-xs" aria-live="polite">
                {amount ? (
                  <span
                    className={`tabular-nums ${remaining === 0 ? 'text-ink-3' : 'text-danger'}`}
                  >
                    {formatMoney(assigned)} of {formatMoney(amount)} assigned
                    {remaining > 0 && ` · ${formatMoney(remaining)} left`}
                    {remaining < 0 && ` · ${formatMoney(remaining)} over`}
                  </span>
                ) : (
                  <span className="text-ink-3">Enter a total first</span>
                )}
                {remaining > 0 && blankMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={splitRemaining}
                    className="font-medium text-primary hover:underline"
                  >
                    Split remaining equally
                  </button>
                )}
              </div>
            </>
          )}
        </fieldset>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}
