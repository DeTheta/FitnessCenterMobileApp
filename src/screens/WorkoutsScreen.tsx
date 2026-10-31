import { useState } from 'react'
import { Bookmark, Clock, Play, SearchX } from 'lucide-react'
import { Button, Chip, ChipRow, EmptyState, Photo, ScreenHeader, SearchField, Segmented } from '@/components/ui'
import { LEVELS, WORKOUT_CATEGORIES, WORKOUTS } from '@/data/workouts'
import { cn } from '@/lib/utils'
import { useBooking } from '@/state/BookingContext'

export function WorkoutsScreen({ onOpenWorkout }: { onOpenWorkout: (id: string) => void }) {
  const { saved, toggleSave, notify } = useBooking()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof WORKOUT_CATEGORIES)[number]>('All')
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All')
  const [savedOnly, setSavedOnly] = useState(false)

  const featured = WORKOUTS.find((w) => w.featured)!
  const q = query.trim().toLowerCase()
  const filtering = !!q || category !== 'All' || level !== 'All' || savedOnly
  const list = WORKOUTS.filter(
    (w) =>
      (filtering || !w.featured) &&
      (category === 'All' || w.category === category) &&
      (level === 'All' || w.level === level) &&
      (!savedOnly || saved.includes(w.id)) &&
      (!q || w.title.toLowerCase().includes(q) || w.category.toLowerCase().includes(q)),
  )

  const reset = () => {
    setQuery('')
    setCategory('All')
    setLevel('All')
    setSavedOnly(false)
  }

  return (
    <div>
      <ScreenHeader
        eyebrow="Free for members"
        title="Workouts"
        right={
          <button
            type="button"
            onClick={() => setSavedOnly((v) => !v)}
            aria-pressed={savedOnly}
            className={cn(
              'mb-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
              savedOnly ? 'bg-brand text-ink' : 'bg-mist text-ink hover:bg-ink/10',
            )}
          >
            <Bookmark className={cn('size-3.5', savedOnly && 'fill-ink')} /> Saved {saved.length}
          </button>
        }
      />

      {!filtering && (
        <article className="relative mx-5 h-[340px] overflow-hidden rounded-[30px] bg-ink text-white">
          <Photo src={featured.image} alt={featured.title} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
          <span className="absolute left-5 top-5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">Featured program</span>
          <SaveButton saved={saved.includes(featured.id)} onClick={() => toggleSave(featured.id)} className="absolute right-5 top-5" />
          <div className="absolute inset-x-5 bottom-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60">
              {featured.level} · {featured.weeks} weeks · {featured.sessionsPerWeek}× / week
            </p>
            <h2 className="mt-2 font-display text-[50px] font-extrabold uppercase leading-[0.85]">{featured.title}</h2>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => notify(`${featured.title} started — Week 1 unlocked`)}
                className="flex-1"
              >
                <Play className="size-4 fill-ink" /> Start program
              </Button>
              <Button variant="glass" onClick={() => onOpenWorkout(featured.id)}>
                Details
              </Button>
            </div>
          </div>
        </article>
      )}

      <div className={cn('space-y-4 px-5', !filtering && 'mt-6')}>
        <SearchField value={query} onChange={setQuery} placeholder="Search programs" />
        <ChipRow>
          {WORKOUT_CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </ChipRow>
        <Segmented label="Level" options={LEVELS} value={level} onChange={setLevel} />
      </div>

      <p className="mt-6 px-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink/45">
        {filtering ? `${list.length} result${list.length === 1 ? '' : 's'}` : 'All programs'}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 px-5">
        {list.map((w) => (
          <div key={w.id} className="group relative aspect-[3/4] overflow-hidden rounded-[24px] bg-ink text-white">
            <button type="button" onClick={() => onOpenWorkout(w.id)} className="absolute inset-0 text-left" aria-label={`Open ${w.title}`}>
              <Photo src={w.image} alt="" className="absolute inset-0 h-full w-full" imgClassName="transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-paper px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">{w.level}</span>
              <span className="absolute inset-x-3.5 bottom-3.5 block">
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-brand">{w.category}</span>
                <span className="mt-1 block font-display text-[22px] font-bold uppercase leading-[0.92]">{w.title}</span>
                <span className="mt-1.5 flex items-center gap-1 text-[11.5px] text-white/65">
                  <Clock className="size-3" /> {w.minutes} min · {w.weeks} wks
                </span>
              </span>
            </button>
            <SaveButton saved={saved.includes(w.id)} onClick={() => toggleSave(w.id)} className="absolute right-2.5 top-2.5" small />
          </div>
        ))}
      </div>

      {list.length === 0 && (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title={savedOnly ? 'Nothing saved yet' : 'No programs found'}
          body={savedOnly ? 'Tap the bookmark on any program to keep it here.' : 'Try a different search or filter.'}
          action={
            <Button variant="outline" onClick={reset}>
              Show all programs
            </Button>
          }
        />
      )}
    </div>
  )
}

export function SaveButton({ saved, onClick, className, small }: { saved: boolean; onClick: () => void; className?: string; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save program'}
      className={cn(
        'grid place-items-center rounded-full transition-all active:scale-90',
        small ? 'size-9' : 'size-10',
        saved ? 'bg-brand text-ink' : 'bg-paper/90 text-ink backdrop-blur hover:bg-paper',
        className,
      )}
    >
      <Bookmark className={cn(small ? 'size-4' : 'size-[18px]', saved && 'fill-ink')} />
    </button>
  )
}
