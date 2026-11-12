// Initials from a name ("Rahul Shah" -> "RS") or, for pending members, an email ("eva@x.com" -> "E").
function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
  }
  return (email?.[0] ?? '?').toUpperCase()
}

export default function Avatar({ name, email, className = '' }) {
  return (
    <span className={`avatar ${className}`} aria-hidden>
      {initials(name, email)}
    </span>
  )
}
