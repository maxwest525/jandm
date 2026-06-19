export function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          <span className="h-7 w-2 animate-pulse rounded-full bg-accent" style={{ animationDelay: '0ms' }} />
          <span className="h-7 w-2 animate-pulse rounded-full bg-accent/70" style={{ animationDelay: '120ms' }} />
          <span className="h-7 w-2 animate-pulse rounded-full bg-accent/40" style={{ animationDelay: '240ms' }} />
        </div>
        <p className="text-sm text-muted">Loading Tempo…</p>
      </div>
    </div>
  )
}
