import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const OVERLAY_ROOT_ID = 'overlay-root'

export function BottomSheet({
  open,
  onClose,
  label,
  children,
  footer,
  tall,
}: {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  footer?: ReactNode
  tall?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [open, onClose])

  const root = typeof document !== 'undefined' ? document.getElementById(OVERLAY_ROOT_ID) : null
  if (!open || !root) return null

  return createPortal(
    <div className="pointer-events-auto absolute inset-0">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/55 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          'absolute inset-x-0 bottom-0 flex animate-sheet-up flex-col overflow-hidden rounded-t-[32px] bg-paper outline-none',
          tall ? 'h-[92%]' : 'max-h-[90%]',
        )}
      >
        <span className="pointer-events-none absolute left-1/2 top-2.5 z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-white/70 mix-blend-difference" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-ink/80 text-white backdrop-blur hover:bg-ink"
        >
          <X className="size-4" />
        </button>
        <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-ink/8 bg-paper px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">{footer}</div>}
      </div>
    </div>,
    root,
  )
}

export function SheetHero({ image, alt, children }: { image: string; alt: string; children: ReactNode }) {
  return (
    <div className="relative h-60 shrink-0">
      <img src={image} alt={alt} className="photo absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
      <div className="absolute inset-x-5 bottom-5 text-white">{children}</div>
    </div>
  )
}

export function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-mist p-3.5">
      <div className="flex items-center gap-1.5 text-ink/45">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 text-[15px] font-semibold leading-tight">{value}</p>
    </div>
  )
}
