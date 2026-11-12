import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as storage from '../data/storage.js'
import Avatar from '../components/Avatar.jsx'
import CloseIcon from '../components/CloseIcon.jsx'
import MemberBadge from '../components/MemberBadge.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CreateGroup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [emailInput, setEmailInput] = useState('')
  // [{ email, name, status }] — excludes the creator, who is always added.
  const [members, setMembers] = useState([])
  const [memberError, setMemberError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function addMember() {
    const email = storage.normaliseEmail(emailInput)
    setMemberError('')
    if (!email) return
    if (!EMAIL_RE.test(email)) return setMemberError('That doesn’t look like an email address')
    if (email === user.email) return setMemberError('You’re already in the group')
    if (members.some((m) => m.email === email)) return setMemberError('Already added')

    const existing = await storage.findUserByEmail(email)
    setMembers((prev) => [
      ...prev,
      existing
        ? { email, name: existing.name, status: 'active' }
        : { email, name: null, status: 'pending' },
    ])
    setEmailInput('')
  }

  function removeMember(email) {
    setMembers((prev) => prev.filter((m) => m.email !== email))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return setError('Please give the group a name')
    setError('')
    setSaving(true)
    try {
      const group = await storage.createGroup({
        name,
        creatorId: user.id,
        memberEmails: members.map((m) => m.email),
      })
      navigate(`/group/${group.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div>
      <Link to="/dashboard" className="text-sm text-ink-2 transition-colors hover:text-ink">
        ← Back to dashboard
      </Link>
      <h1 className="mb-6 mt-3 text-xl text-ink">Create a group</h1>

      <form onSubmit={handleSave} className="card space-y-6">
        <div>
          <label htmlFor="group-name" className="label">
            Group name
          </label>
          <input
            id="group-name"
            autoFocus
            className="input"
            placeholder="e.g. Lisbon trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="member-email" className="label">
            Add members by email
          </label>
          <div className="flex gap-2">
            <input
              id="member-email"
              type="email"
              className="input"
              placeholder="friend@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                // Enter adds the member instead of submitting the form.
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addMember()
                }
              }}
            />
            <button type="button" onClick={addMember} className="btn btn-secondary shrink-0">
              Add
            </button>
          </div>
          {memberError && <p className="mt-1.5 text-sm text-danger">{memberError}</p>}

          <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
            <li className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={user.name} email={user.email} />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">
                {user.name} <span className="text-ink-3">(you)</span>
              </span>
              <MemberBadge status="active" />
              {/* Keeps the badge aligned with the rows that have a remove button. */}
              <span className="w-8" aria-hidden />
            </li>
            {members.map((m) => (
              <li key={m.email} className="flex items-center gap-3 px-3 py-2.5">
                <Avatar name={m.name} email={m.email} />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {m.name ?? m.email}
                  {m.name && <span className="ml-2 text-xs text-ink-3">{m.email}</span>}
                </span>
                <MemberBadge status={m.status} />
                <button
                  type="button"
                  onClick={() => removeMember(m.email)}
                  className="icon-btn"
                  aria-label={`Remove ${m.email}`}
                >
                  <CloseIcon size={14} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-3">
            People without an account are added as pending. They get access when they register
            with that email.
          </p>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={saving} className="btn btn-primary btn-block">
          Create group
        </button>
      </form>
    </div>
  )
}
