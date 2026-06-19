import { ServerCrash } from 'lucide-react'

export function FullScreenError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center shadow-pop">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <ServerCrash size={24} />
        </div>
        <h1 className="text-base font-semibold text-content">Can’t reach the server</h1>
        <p className="mt-1.5 text-sm text-muted">{message}</p>
        <p className="mt-3 text-2xs text-subtle">
          Make sure the API is running — start everything with <code className="rounded bg-surface-2 px-1 py-0.5 font-mono">npm run dev</code>.
        </p>
        <button
          onClick={onRetry}
          className="mt-5 inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-contrast transition-all hover:brightness-110 active:scale-95"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
