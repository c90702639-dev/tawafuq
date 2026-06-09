import React from 'react'

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, className = '', disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-2xl font-arabic font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rose focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none'

    const variants = {
      primary:
        'bg-brand-rose text-white hover:bg-brand-rose-dark active:scale-[0.98] shadow-brand',
      secondary:
        'bg-brand-cream-dark text-brand-ink hover:bg-brand-sand active:scale-[0.98] border border-brand-sand',
      ghost:
        'bg-transparent text-brand-ink-muted hover:bg-brand-cream-dark active:scale-[0.98]',
      danger:
        'bg-red-100 text-red-700 hover:bg-red-200 active:scale-[0.98]',
    }

    const sizes = {
      sm: 'h-9  px-4  text-sm',
      md: 'h-11 px-6  text-base',
      lg: 'h-14 px-8  text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[base, variants[variant], sizes[size], fullWidth ? 'w-full' : '', className].join(' ')}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children:   React.ReactNode
  className?: string
  padding?:   'sm' | 'md' | 'lg'
  elevated?:  boolean
}

export function Card({ children, className = '', padding = 'md', elevated = false }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' }
  return (
    <div
      className={[
        'rounded-3xl bg-white border border-brand-sand',
        elevated ? 'shadow-card-lg' : 'shadow-card',
        paddings[padding],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value:      number   // 0–100
  max?:       number
  label?:     string
  color?:     string
  className?: string
  animated?:  boolean
}

export function ProgressBar({ value, max = 100, label, color = 'bg-brand-rose', className = '', animated = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-1.5 text-sm font-arabic">
          <span className="text-brand-ink font-medium">{label}</span>
          <span className="text-brand-ink-muted">{Math.round(pct)}٪</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-brand-cream-dark overflow-hidden">
        <div
          className={[color, 'h-full rounded-full', animated ? 'transition-all duration-700 ease-spring' : ''].join(' ')}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children:   React.ReactNode
  variant?:   'rose' | 'sand' | 'green' | 'amber'
  className?: string
}

export function Badge({ children, variant = 'rose', className = '' }: BadgeProps) {
  const variants = {
    rose:  'bg-brand-rose-light text-brand-rose-dark',
    sand:  'bg-brand-cream-dark text-brand-ink-muted',
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
  }
  return (
    <span className={['inline-flex items-center rounded-full px-3 py-0.5 text-xs font-arabic font-medium', variants[variant], className].join(' ')}>
      {children}
    </span>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <hr className={['border-brand-sand', className].join(' ')} />
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div
      className={['rounded-full border-2 border-brand-sand border-t-brand-rose animate-spin', sizes[size], className].join(' ')}
      role="status"
      aria-label="جارٍ التحميل"
    />
  )
}

// ─── ErrorMessage ─────────────────────────────────────────────────────────────
export function ErrorMessage({ message, className = '' }: { message: string; className?: string }) {
  return (
    <div className={['rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 font-arabic text-sm text-center', className].join(' ')}>
      {message}
    </div>
  )
}
