import { AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

export function ErrorState() {
  const { resetData } = useData()
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-negative/10 text-negative">
        <AlertTriangle size={24} />
      </div>
      <h2 className="text-lg font-semibold text-content">Something went wrong</h2>
      <p className="mt-1 text-sm text-muted">
        We couldn’t load your saved data. Resetting to the sample dataset usually fixes it.
      </p>
      <div className="mt-6">
        <Button onClick={resetData}>Reset to sample data</Button>
      </div>
    </Card>
  )
}
