// The only module in the app that touches localStorage.
//
// Every function is async even though localStorage is synchronous, so the rest
// of the app already treats data access as async. Swapping this file for a
// Supabase implementation later should not require changes elsewhere.
//
// Money is always stored as integer pence to avoid floating point errors.
// Group members are identified by their (lowercased) email, because pending
// members don't have a user id yet.

const KEYS = {
  users: 'splitmate.users',
  groups: 'splitmate.groups',
  expenses: 'splitmate.expenses',
  session: 'splitmate.session',
  seeded: 'splitmate.seeded',
}

const TEST_USERS = [
  { name: 'Charles', email: 'charles@test.com', password: 'password' },
  { name: 'Bob', email: 'bob@test.com', password: 'password' },
  { name: 'Rahul', email: 'rahul@test.com', password: 'password' },
  { name: 'Eva', email: 'eva@test.com', password: 'password' },
]

// ---------- low-level helpers ----------

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function normaliseEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

// Strip the password before a user leaves this module (except for auth).
function publicUser(user) {
  if (!user) return null
  const { password: _password, ...rest } = user
  return rest
}

// ---------- seeding ----------

export async function ensureSeeded() {
  if (read(KEYS.seeded, false)) return
  const users = read(KEYS.users, [])
  const now = new Date().toISOString()
  for (const t of TEST_USERS) {
    if (!users.some((u) => u.email === t.email)) {
      users.push({ id: newId(), ...t, createdAt: now })
    }
  }
  write(KEYS.users, users)
  write(KEYS.seeded, true)
}

// ---------- users ----------

export async function getUserById(id) {
  return publicUser(read(KEYS.users, []).find((u) => u.id === id))
}

export async function findUserByEmail(email) {
  const e = normaliseEmail(email)
  return publicUser(read(KEYS.users, []).find((u) => u.email === e))
}

// Returns the full record including password. Only AuthContext should call this.
export async function getUserRecordByEmail(email) {
  const e = normaliseEmail(email)
  return read(KEYS.users, []).find((u) => u.email === e) ?? null
}

export async function createUser({ name, email, password }) {
  const users = read(KEYS.users, [])
  const e = normaliseEmail(email)
  if (users.some((u) => u.email === e)) {
    throw new Error('An account with this email already exists')
  }
  const user = {
    id: newId(),
    name: name.trim(),
    email: e,
    password,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  write(KEYS.users, users)

  // Anyone who was invited to a group before registering becomes active now.
  const groups = read(KEYS.groups, [])
  let changed = false
  for (const g of groups) {
    for (const m of g.members) {
      if (m.email === e && m.status === 'pending') {
        m.status = 'active'
        m.userId = user.id
        changed = true
      }
    }
  }
  if (changed) write(KEYS.groups, groups)

  return publicUser(user)
}

// ---------- session ----------

export async function getSessionUserId() {
  return read(KEYS.session, null)?.userId ?? null
}

export async function setSessionUserId(userId) {
  write(KEYS.session, { userId })
}

export async function clearSession() {
  localStorage.removeItem(KEYS.session)
}

// ---------- groups ----------

// Adds display info to members: active members get their current name.
function withMemberNames(group, users) {
  return {
    ...group,
    members: group.members.map((m) => {
      const user = m.userId ? users.find((u) => u.id === m.userId) : null
      return { ...m, name: user?.name ?? null }
    }),
  }
}

export async function getGroupsForUser(userId) {
  const users = read(KEYS.users, [])
  return read(KEYS.groups, [])
    .filter((g) => g.members.some((m) => m.userId === userId && m.status === 'active'))
    .map((g) => withMemberNames(g, users))
}

export async function getGroup(id) {
  const group = read(KEYS.groups, []).find((g) => g.id === id)
  return group ? withMemberNames(group, read(KEYS.users, [])) : null
}

export async function createGroup({ name, creatorId, memberEmails }) {
  const users = read(KEYS.users, [])
  const creator = users.find((u) => u.id === creatorId)
  if (!creator) throw new Error('Creator not found')

  const emails = [creator.email, ...memberEmails.map(normaliseEmail)]
  const unique = [...new Set(emails.filter(Boolean))]

  const members = unique.map((email) => {
    const user = users.find((u) => u.email === email)
    return user
      ? { email, userId: user.id, status: 'active' }
      : { email, userId: null, status: 'pending' }
  })

  const group = {
    id: newId(),
    name: name.trim(),
    createdBy: creatorId,
    createdAt: new Date().toISOString(),
    members,
  }
  const groups = read(KEYS.groups, [])
  groups.push(group)
  write(KEYS.groups, groups)
  return withMemberNames(group, users)
}

// ---------- expenses ----------

// Soft-deleted expenses are excluded unless includeDeleted is set.
export async function getExpenses(groupId, { includeDeleted = false } = {}) {
  return read(KEYS.expenses, []).filter(
    (e) => e.groupId === groupId && (includeDeleted || !e.isDeleted),
  )
}

// expense: { groupId, description, amount (pence), date ('YYYY-MM-DD'),
//            paidBy (member email), splits: [{ email, amount (pence) }],
//            splitType ('equal' | 'manual'), createdBy }
export async function addExpense(expense) {
  // Balances assume the splits add up to the total, so never store one that doesn't.
  const splits = expense.splits ?? []
  const validShares = splits.every((s) => Number.isInteger(s.amount) && s.amount > 0)
  const sum = splits.reduce((total, s) => total + s.amount, 0)
  if (!splits.length || !validShares || sum !== expense.amount) {
    throw new Error("The split amounts don't add up to the total")
  }

  const record = {
    id: newId(),
    ...expense,
    isDeleted: false,
    createdAt: new Date().toISOString(),
  }
  const expenses = read(KEYS.expenses, [])
  expenses.push(record)
  write(KEYS.expenses, expenses)
  return record
}

// Never removes the record, only flags it.
export async function softDeleteExpense(expenseId, deletedBy) {
  const expenses = read(KEYS.expenses, [])
  const expense = expenses.find((e) => e.id === expenseId)
  if (!expense) throw new Error('Expense not found')
  expense.isDeleted = true
  expense.deletedAt = new Date().toISOString()
  expense.deletedBy = deletedBy
  write(KEYS.expenses, expenses)
  return expense
}
