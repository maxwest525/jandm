import type { Category } from '../../types'
import { CATEGORY_META } from '../../lib/categories'

export function CategoryDot({ category, size = 8 }: { category: Category; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: CATEGORY_META[category].color }}
      aria-hidden
    />
  )
}

export function CategoryBadge({ category }: { category: Category }) {
  const { color, icon: Icon } = CATEGORY_META[category]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
      style={{ color, background: `${color}1a` }}
    >
      <Icon size={13} strokeWidth={2.2} />
      {category}
    </span>
  )
}

export function CategoryIcon({ category, size = 18 }: { category: Category; size?: number }) {
  const { color, icon: Icon } = CATEGORY_META[category]
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl"
      style={{
        color,
        background: `${color}1f`,
        width: size + 18,
        height: size + 18,
      }}
    >
      <Icon size={size} strokeWidth={2.1} />
    </span>
  )
}
