import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ImageOff, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Photo({ src, alt, className, imgClassName }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={cn('relative overflow-hidden bg-ink/10', className)}>
      {failed ? (
        <div className="grid h-full w-full place-items-center text-ink/30">
          <ImageOff className="size-6" aria-hidden />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn('photo h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  )
}

type Variant = 'brand' | 'ink' | 'outline' | 'ghost' | 'glass'
const VARIANTS: Record<Variant, string> = {
  brand: 'bg-brand text-ink hover:bg-brand-deep',
  ink: 'bg-ink text-white hover:bg-ink/85',
  outline: 'border border-ink/15 bg-paper text-ink hover:border-ink/40',
  ghost: 'bg-mist text-ink hover:bg-ink/10',
  glass: 'bg-white/15 text-white backdrop-blur-md hover:bg-white/25',
}

export function Button({
  variant = 'brand',
  size = 'md',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all active:scale-[0.97] disabled:pointer-events-none',
        size === 'sm' && 'h-9 px-4 text-[13px]',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-14 px-6 text-[15px]',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Chip({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors',
        active ? 'bg-brand text-ink' : 'border border-ink/10 bg-paper text-ink/70 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">{children}</div>
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-mist p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn(
            'h-8 flex-1 rounded-full text-[12px] font-semibold capitalize transition-all',
            value === o ? 'bg-ink text-white shadow-sm' : 'text-ink/55 hover:text-ink',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-full bg-mist px-4 focus-within:ring-2 focus-within:ring-brand">
      <Search className="size-[18px] text-ink/40" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-full flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-ink/40"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="text-ink/40 hover:text-ink">
          <X className="size-4" />
        </button>
      )}
    </label>
  )
}

export function ScreenHeader({ eyebrow, title, right }: { eyebrow: string; title: string; right?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-4 px-5 pb-5 pt-4">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
        <h1 className="mt-1 font-display text-[52px] font-extrabold uppercase leading-[0.85] tracking-tight">{title}</h1>
      </div>
      {right}
    </header>
  )
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-baseline justify-between px-5">
      <h2 className="font-display text-[26px] font-bold uppercase leading-none tracking-tight">{title}</h2>
      {action && (
        <button type="button" onClick={onAction} className="text-[13px] font-semibold text-ink/50 hover:text-brand">
          {action}
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mx-5 flex flex-col items-center rounded-[28px] border border-dashed border-ink/15 px-6 py-10 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-mist text-ink">{icon}</div>
      <p className="mt-4 font-display text-2xl font-bold uppercase">{title}</p>
      <p className="mt-1 max-w-[240px] text-[13px] text-ink/55">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Meter({ value, max, tone = 'ink', className }: { value: number; max: number; tone?: 'ink' | 'brand'; className?: string }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100)
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-ink/10', className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tone === 'brand' ? 'bg-brand' : 'bg-ink')}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
