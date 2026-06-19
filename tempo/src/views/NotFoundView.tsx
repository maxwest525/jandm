import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '../components/states/EmptyState'

export function NotFoundView() {
  return (
    <div className="grid h-full place-items-center">
      <EmptyState
        icon={Compass}
        title="Nothing here"
        description="This page doesn’t exist."
        action={
          <Link
            to="/my-work"
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-contrast transition-all hover:brightness-110"
          >
            Go to My Work
          </Link>
        }
      />
    </div>
  )
}
