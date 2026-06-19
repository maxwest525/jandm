import type { ReactNode, SelectHTMLAttributes } from 'react'

export function Field({
  label,
  htmlFor,
  children,
  error,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
  error?: string
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-subtle">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-2xs font-medium text-red-400">{error}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-sm text-content placeholder:text-subtle outline-none transition-colors focus:border-accent'

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-9 w-full cursor-pointer rounded-lg border border-border bg-surface-2/50 px-2.5 text-sm text-content outline-none transition-colors focus:border-accent ${className}`}
    />
  )
}
