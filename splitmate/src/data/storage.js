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

// Ask the browser to treat our data as persistent so it isn't cleared when
// disk space runs low. Browsers may say no; that's fine, data is still saved.
async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    // Not supported, nothing to do.
  }
}

export async function ensureSeeded() {
  requestPersistentStorage()
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
    .filter(
      (g) => !g.isDeleted && g.members.some((m) => m.userId === userId && m.status === 'active'),
    )
    .map((g) => withMemberNames(g, users))
}

export async function getGroup(id) {
  const group = read(KEYS.groups, []).find((g) => g.id === id && !g.isDeleted)
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

// Like expenses, a group is only flagged as deleted, never removed, so it can
// be recovered from localStorage if deleted by mistake.
export async function softDeleteGroup(groupId, deletedBy) {
  const groups = read(KEYS.groups, [])
  const group = groups.find((g) => g.id === groupId)
  if (!group) throw new Error('Group not found')
  group.isDeleted = true
  group.deletedAt = new Date().toISOString()
  group.deletedBy = deletedBy
  write(KEYS.groups, groups)
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

// ---------- moving groups between copies of the app ----------
//
// Each address (e.g. localhost:5173 vs :5174) has its own storage, so a group
// made at one can't be seen at the other. These let a group be saved to a file
// at one address and loaded at another.

export async function exportGroups(groupIds) {
  const ids = new Set(groupIds)
  const groups = read(KEYS.groups, []).filter((g) => ids.has(g.id))
  const expenses = read(KEYS.expenses, []).filter((e) => ids.has(e.groupId))
  const userIds = new Set([
    ...groups.flatMap((g) => [g.createdBy, ...g.members.map((m) => m.userId)]),
    ...expenses.flatMap((e) => [e.createdBy, e.deletedBy]),
  ])
  // Only id, name and email go in the file, so it never carries a password.
  const users = read(KEYS.users, [])
    .filter((u) => userIds.has(u.id))
    .map(({ id, name, email }) => ({ id, name, email }))
  return { app: 'splitmate', version: 1, users, groups, expenses }
}

// Adds what isn't already here; never overwrites. The same person has a
// different id at each address, so people are matched by email. Accounts are
// never created from a file: members without an account here join as pending
// and become active when they register (see createUser).
export async function importGroups(data) {
  if (data?.app !== 'splitmate' || !Array.isArray(data.groups)) {
    throw new Error("That file isn't a Splitmate group file")
  }
  const users = read(KEYS.users, [])
  const groups = read(KEYS.groups, [])
  const expenses = read(KEYS.expenses, [])
  write('splitmate.backup-before-import', { users, groups, expenses })

  const idMap = {}
  for (const u of data.users ?? []) {
    const local = users.find((x) => x.email === normaliseEmail(u.email))
    if (local) idMap[u.id] = local.id
  }
  const fix = (id) => (id ? (idMap[id] ?? id) : id)

  const added = []
  for (const g of data.groups) {
    if (groups.some((x) => x.id === g.id)) continue
    groups.push({
      ...g,
      createdBy: fix(g.createdBy),
      members: g.members.map((m) => {
        const u = users.find((x) => x.email === m.email)
        return u
          ? { ...m, userId: u.id, status: 'active' }
          : { ...m, userId: null, status: 'pending' }
      }),
    })
    added.push(g.name)
  }

  let newExpenses = 0
  for (const e of data.expenses ?? []) {
    if (expenses.some((x) => x.id === e.id)) continue
    expenses.push({ ...e, createdBy: fix(e.createdBy), deletedBy: fix(e.deletedBy) })
    newExpenses++
  }

  write(KEYS.groups, groups)
  write(KEYS.expenses, expenses)
  return { groups: added, expenses: newExpenses }
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
