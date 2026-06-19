export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-contrast shadow-sm shadow-brand/30">
        <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden>
          <path
            d="M7 22c2.6-9 5.6-9 8.2-4.5S20.8 24 24 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="10" r="2.4" fill="currentColor" />
        </svg>
      </div>
      {!compact && (
        <span className="text-[17px] font-bold tracking-tight text-content">
          Flow<span className="text-brand">Budget</span>
        </span>
      )}
    </div>
  )
}
