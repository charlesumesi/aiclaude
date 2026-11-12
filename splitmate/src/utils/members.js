// Display helpers for group members.

// "You" for the current user, their name if registered, otherwise their email.
export function memberLabel(member, currentEmail) {
  if (member.email === currentEmail) return 'You'
  return member.name ?? member.email
}

export function memberLabelByEmail(members, email, currentEmail) {
  const member = members.find((m) => m.email === email)
  return member ? memberLabel(member, currentEmail) : email
}
