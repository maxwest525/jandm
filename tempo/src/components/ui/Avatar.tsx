import type { User } from '../../types'

export function Avatar({
  user,
  size = 22,
  ring = false,
}: {
  user?: User
  size?: number
  ring?: boolean
}) {
  if (!user) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-border-2 text-subtle"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        title="Unassigned"
        aria-label="Unassigned"
      >
        ?
      </span>
    )
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${
        ring ? 'ring-2 ring-surface' : ''
      }`}
      style={{ width: size, height: size, fontSize: size * 0.4, background: user.color }}
      title={user.name}
      aria-label={user.name}
    >
      {user.initials}
    </span>
  )
}
