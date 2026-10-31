import { CalendarDays, Dumbbell, House, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tab = 'home' | 'classes' | 'trainers' | 'workouts'

export const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'classes', label: 'Classes', icon: CalendarDays },
  { id: 'trainers', label: 'Trainers', icon: Users },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
]

export function TabBar({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      aria-label="Main"
      className="absolute inset-x-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-30 flex h-[68px] items-center justify-between rounded-full bg-ink p-2 shadow-[0_20px_40px_-12px_rgba(10,10,10,0.5)] sm:bottom-6"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            className={cn(
              'flex h-full items-center justify-center gap-2 rounded-full transition-all duration-300 ease-out',
              active ? 'flex-[1.9] bg-brand text-ink' : 'flex-1 text-white/55 hover:text-white',
            )}
          >
            <Icon className="size-[21px] shrink-0" strokeWidth={active ? 2.4 : 2} />
            {active && <span className="animate-fade-in text-[13px] font-bold">{label}</span>}
          </button>
        )
      })}
    </nav>
  )
}
