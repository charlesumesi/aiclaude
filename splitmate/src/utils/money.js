// All amounts in the app are integer pence.

const whole = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})
const exact = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })

// 180000 -> "£1,800", 1250 -> "£12.50". Always positive; callers add the wording.
export function formatMoney(pence) {
  const abs = Math.abs(pence)
  return abs % 100 === 0 ? whole.format(abs / 100) : exact.format(abs / 100)
}

// "12.5" -> 1250. Returns null for anything that isn't a valid positive amount.
// With allowZero, "0" -> 0 is accepted too (blank is still null).
export function parseAmount(input, { allowZero = false } = {}) {
  const s = String(input ?? '').trim().replace(/[£,]/g, '')
  if (!/^\d+(\.\d{0,2})?$/.test(s) && !/^\.\d{1,2}$/.test(s)) return null
  const pence = Math.round(parseFloat(s) * 100)
  return pence > 0 || (allowZero && pence === 0) ? pence : null
}

// 1250 -> "12.50", for pre-filling an amount input.
export function penceToInput(pence) {
  return (pence / 100).toFixed(2)
}

// Splits a total across keys as evenly as possible. Leftover pennies go to
// the first people in the list so the shares always add up to the total.
export function splitEqually(total, keys) {
  if (!keys.length || !total) return keys.map((key) => ({ key, amount: 0 }))
  const base = Math.floor(total / keys.length)
  const remainder = total - base * keys.length
  return keys.map((key, i) => ({ key, amount: base + (i < remainder ? 1 : 0) }))
}
