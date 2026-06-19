import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[.98] focus-visible:ring-0'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-brand-contrast hover:brightness-110 shadow-sm shadow-brand/20',
  outline:
    'border border-border-strong text-content bg-surface hover:bg-surface-2',
  ghost: 'text-muted hover:text-content hover:bg-surface-2',
  danger: 'text-negative hover:bg-negative/10 border border-transparent',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  )
})
