import { Plus } from 'lucide-react'
import type { ViewKey } from '../../types'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Logo } from './Logo'

const TITLES: Record<ViewKey, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Your money at a glance this month.' },
  transactions: { title: 'Transactions', subtitle: 'Search, filter, and review every entry.' },
  budgets: { title: 'Budgets', subtitle: 'Track spending against your monthly limits.' },
}

export function Header({ view, onAdd }: { view: ViewKey; onAdd: () => void }) {
  const { title, subtitle } = TITLES[view]
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-canvas/80 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight text-content">{title}</h1>
            <p className="text-[13px] text-muted">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={onAdd} size="md" className="shrink-0">
            <Plus size={17} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
