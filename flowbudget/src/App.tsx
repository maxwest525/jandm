import { useState } from 'react'
import type { ViewKey } from './types'
import { useData } from './context/DataContext'
import { Sidebar } from './components/layout/Sidebar'
import { MobileNav } from './components/layout/MobileNav'
import { Header } from './components/layout/Header'
import { OverviewView } from './components/dashboard/OverviewView'
import { TransactionsView } from './components/transactions/TransactionsView'
import { BudgetsView } from './components/budgets/BudgetsView'
import { AddTransactionModal } from './components/transactions/AddTransactionModal'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'

export default function App() {
  const { status } = useData()
  const [view, setView] = useState<ViewKey>('overview')
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar view={view} onChange={setView} />

      <div className="lg:pl-[248px]">
        <Header view={view} onAdd={() => setAddOpen(true)} />

        <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          {status === 'loading' && <LoadingState />}
          {status === 'error' && <ErrorState />}
          {status === 'ready' && (
            <div key={view} className="animate-slide-up">
              {view === 'overview' && <OverviewView onNavigate={setView} />}
              {view === 'transactions' && <TransactionsView onAdd={() => setAddOpen(true)} />}
              {view === 'budgets' && <BudgetsView />}
            </div>
          )}
        </main>
      </div>

      <MobileNav view={view} onChange={setView} />
      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
