export default function MemberBadge({ status }) {
  return status === 'pending' ? (
    <span className="badge badge-pending">pending</span>
  ) : (
    <span className="badge badge-active">active</span>
  )
}
