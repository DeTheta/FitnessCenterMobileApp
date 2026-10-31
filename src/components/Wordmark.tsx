import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-extrabold uppercase italic leading-none tracking-tight', className)}>
      Optimum<span className="text-brand">+</span>
    </span>
  )
}
