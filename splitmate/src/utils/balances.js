// Balance calculation. Pure functions, always recalculated from scratch.

// Groups up to this size (people with a non-zero balance) get the exact
// minimum number of payments. Larger groups fall back to a greedy match,
// which still needs at most (people - 1) payments.
const EXACT_LIMIT = 15

// Net balance per member email, in pence. Positive = owed money, negative = owes.
export function computeNetBalances(memberEmails, expenses) {
  const net = new Map(memberEmails.map((e) => [e, 0]))
  for (const expense of expenses) {
    if (expense.isDeleted) continue
    net.set(expense.paidBy, (net.get(expense.paidBy) ?? 0) + expense.amount)
    for (const split of expense.splits) {
      net.set(split.email, (net.get(split.email) ?? 0) - split.amount)
    }
  }
  return net
}

// Turns net balances into the fewest payments: [{ from, to, amount }].
//
// The minimum number of payments is (people with a balance) minus (the largest
// number of separate sub-groups whose balances each add up to zero), because
// each zero-sum sub-group can be settled on its own with (size - 1) payments.
export function settleDebts(netBalances) {
  const people = [...netBalances]
    .filter(([, amount]) => amount !== 0)
    .map(([key, amount]) => ({ key, amount }))
  if (people.length === 0) return []

  const groups = people.length <= EXACT_LIMIT ? zeroSumGroups(people) : [people]
  return groups.flatMap(settleGreedy)
}

// Settles one set of people whose balances sum to zero.
function settleGreedy(people) {
  const creditors = people
    .filter((p) => p.amount > 0)
    .map((p) => ({ ...p }))
    .sort((a, b) => b.amount - a.amount)
  const debtors = people
    .filter((p) => p.amount < 0)
    .map((p) => ({ key: p.key, amount: -p.amount }))
    .sort((a, b) => b.amount - a.amount)

  const payments = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount)
    payments.push({ from: debtors[i].key, to: creditors[j].key, amount })
    debtors[i].amount -= amount
    creditors[j].amount -= amount
    if (debtors[i].amount === 0) i++
    if (creditors[j].amount === 0) j++
  }
  return payments
}

// Splits people into the largest possible number of zero-sum sub-groups.
// dp[mask] = most zero-sum groups that can be peeled off the people in `mask`.
function zeroSumGroups(people) {
  const n = people.length
  const size = 1 << n
  const full = size - 1

  const sum = new Array(size).fill(0)
  for (let mask = 1; mask < size; mask++) {
    const low = mask & -mask
    sum[mask] = sum[mask ^ low] + people[31 - Math.clz32(low)].amount
  }

  const dp = new Uint8Array(size)
  for (let mask = 1; mask < size; mask++) {
    let best = 0
    for (let i = 0; i < n; i++) {
      const bit = 1 << i
      if (mask & bit && dp[mask ^ bit] > best) best = dp[mask ^ bit]
    }
    dp[mask] = best + (sum[mask] === 0 ? 1 : 0)
  }

  // Walk back down the best path, removing one person at a time. Each time we
  // land on a zero-sum set, the people removed since the last one form a group.
  const groups = []
  let mask = full
  let groupStart = full
  while (mask) {
    const bonus = sum[mask] === 0 ? 1 : 0
    for (let i = 0; i < n; i++) {
      const bit = 1 << i
      if (mask & bit && dp[mask ^ bit] + bonus === dp[mask]) {
        mask ^= bit
        break
      }
    }
    if (sum[mask] === 0) {
      const removed = groupStart ^ mask
      groups.push(people.filter((_, i) => removed & (1 << i)))
      groupStart = mask
    }
  }
  return groups
}
