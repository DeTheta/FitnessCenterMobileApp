import { DAYS, dayNumber, weekdayShort } from '@/lib/dates'
import { cn } from '@/lib/utils'

export function DateStrip({ value, onChange, marked }: { value: number; onChange: (d: number) => void; marked?: Set<number> }) {
  return (
    <div role="tablist" aria-label="Choose a day" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {DAYS.map((d) => {
        const active = d === value
        return (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(d)}
            className={cn(
              'relative flex h-[76px] w-[54px] shrink-0 flex-col items-center justify-center rounded-[20px] transition-all active:scale-95',
              active ? 'bg-ink text-white shadow-lg shadow-ink/20' : 'bg-mist text-ink hover:bg-ink/10',
            )}
          >
            <span className={cn('text-[11px] font-semibold uppercase tracking-wider', active ? 'text-white/60' : 'text-ink/45')}>
              {d === 0 ? 'Today' : weekdayShort(d)}
            </span>
            <span className="font-display text-[26px] font-bold leading-none">{dayNumber(d)}</span>
            {marked?.has(d) && <span className="absolute bottom-2 size-1.5 rounded-full bg-brand" aria-label="You have a booking" />}
          </button>
        )
      })}
    </div>
  )
}
