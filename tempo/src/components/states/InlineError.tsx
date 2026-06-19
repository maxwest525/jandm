import { AlertCircle } from 'lucide-react'

export function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <AlertCircle size={20} />
      </div>
      <div>
        <p className="text-sm font-medium text-content">Couldn’t load this view</p>
        <p className="mt-1 text-[13px] text-muted">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="h-8 rounded-lg border border-border px-3 text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-content"
      >
        Retry
      </button>
    </div>
  )
}
