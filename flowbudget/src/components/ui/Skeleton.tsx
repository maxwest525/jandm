export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-lg bg-surface-2 ${className}`} />
}
