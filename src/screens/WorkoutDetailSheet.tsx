import { Play } from 'lucide-react'
import { BottomSheet, SheetHero } from '@/components/BottomSheet'
import { Button } from '@/components/ui'
import { WORKOUTS } from '@/data/workouts'
import { useBooking } from '@/state/BookingContext'
import { SaveButton } from './WorkoutsScreen'

export function WorkoutDetailSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { saved, toggleSave, notify } = useBooking()
  const w = WORKOUTS.find((x) => x.id === id)

  return (
    <BottomSheet
      open={!!w}
      onClose={onClose}
      tall
      label={w ? w.title : 'Workout'}
      footer={
        w && (
          <div className="flex gap-2">
            <SaveButton saved={saved.includes(w.id)} onClick={() => toggleSave(w.id)} className="size-14 border border-ink/15" />
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                notify('Workout started — let’s go')
                onClose()
              }}
            >
              <Play className="size-4 fill-ink" /> Start workout
            </Button>
          </div>
        )
      }
    >
      {w && (
        <>
          <SheetHero image={w.image} alt={w.title}>
            <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">{w.category}</span>
            <h2 className="mt-3 font-display text-[46px] font-extrabold uppercase leading-[0.85]">{w.title}</h2>
          </SheetHero>
          <div className="p-5">
            <div className="grid grid-cols-4 divide-x divide-ink/8 rounded-[22px] bg-mist py-3.5 text-center">
              {[
                [w.weeks, 'Weeks'],
                [`${w.sessionsPerWeek}×`, 'Per week'],
                [w.minutes, 'Minutes'],
                [w.level.slice(0, 3), 'Level'],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-[26px] font-bold uppercase leading-none">{v}</p>
                  <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink/45">{l}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-[14.5px] leading-relaxed text-ink/70">{w.description}</p>

            <h3 className="mt-7 font-display text-[24px] font-bold uppercase leading-none">Session breakdown</h3>
            <ol className="mt-3 divide-y divide-ink/8">
              {w.exercises.map((e, i) => (
                <li key={e.name} className="flex items-center gap-4 py-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink font-display text-[18px] font-bold text-white">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{e.name}</p>
                    <p className="text-[12.5px] text-ink/50">Rest {e.restSec}s</p>
                  </div>
                  <p className="font-display text-[20px] font-bold tabular-nums">
                    {e.sets}
                    <span className="text-brand"> × </span>
                    {e.reps}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </BottomSheet>
  )
}
