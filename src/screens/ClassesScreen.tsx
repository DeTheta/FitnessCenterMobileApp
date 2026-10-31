import { useMemo, useState } from 'react'
import { CalendarDays, Check, Clock, Info, MapPin, SearchX, User, Zap } from 'lucide-react'
import { BottomSheet, InfoTile, SheetHero } from '@/components/BottomSheet'
import { DateStrip } from '@/components/DateStrip'
import { Button, Chip, ChipRow, EmptyState, Meter, Photo, ScreenHeader, Segmented } from '@/components/ui'
import { CLASS_CATEGORIES } from '@/data/classes'
import type { ClassSession } from '@/data/types'
import { dayLabel, dayPart, endTime, isPast, longDate, useNow, type DayPart } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { useBooking } from '@/state/BookingContext'

const PARTS = ['all', 'morning', 'afternoon', 'evening'] as const

function spotsInfo(c: ClassSession) {
  const left = c.capacity - c.booked
  if (left <= 0) return { left, label: 'Full · join waitlist', tone: 'muted' as const }
  if (left <= 3) return { left, label: `Only ${left} spot${left > 1 ? 's' : ''} left`, tone: 'hot' as const }
  return { left, label: `${left} of ${c.capacity} spots left`, tone: 'ok' as const }
}

export function ClassesScreen() {
  const now = useNow()
  const { classes, bookings, bookClass, cancel, notify } = useBooking()
  const [day, setDay] = useState(0)
  const [category, setCategory] = useState<(typeof CLASS_CATEGORIES)[number]>('All')
  const [part, setPart] = useState<'all' | DayPart>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const bookedIds = useMemo(() => new Set(bookings.filter((b) => b.kind === 'class').map((b) => b.refId)), [bookings])
  const markedDays = useMemo(() => new Set(bookings.map((b) => b.dayOffset)), [bookings])

  const list = classes.filter(
    (c) => c.dayOffset === day && (category === 'All' || c.category === category) && (part === 'all' || dayPart(c.start) === part),
  )
  const open = classes.find((c) => c.id === openId) ?? null
  const openBooked = open ? bookedIds.has(open.id) : false

  return (
    <div>
      <ScreenHeader
        eyebrow="Group fitness"
        title="Classes"
        right={
          <span className="mb-1 flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[12px] font-semibold">
            <span className="size-1.5 rounded-full bg-brand" /> {bookedIds.size} booked
          </span>
        }
      />

      <div className="space-y-4 px-5">
        <DateStrip value={day} onChange={setDay} marked={markedDays} />
        <Segmented label="Time of day" options={PARTS} value={part} onChange={setPart} />
        <ChipRow>
          {CLASS_CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </ChipRow>
      </div>

      <p className="mt-6 px-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink/45">
        {dayLabel(day)} · {list.length} class{list.length === 1 ? '' : 'es'}
      </p>

      <div className="mt-3 space-y-3 px-5">
        {list.map((c) => {
          const booked = bookedIds.has(c.id)
          const past = isPast(c.dayOffset, c.start, now)
          const spots = spotsInfo(c)
          return (
            <article
              key={c.id}
              className={cn(
                'flex gap-3.5 rounded-[24px] border p-3 transition-colors',
                booked ? 'border-ink bg-paper' : 'border-ink/8 bg-paper',
                past && 'opacity-45',
              )}
            >
              <button type="button" onClick={() => setOpenId(c.id)} aria-label={`View ${c.name} details`} className="shrink-0">
                <Photo src={c.image} alt="" className="h-[112px] w-[84px] rounded-[18px]" />
              </button>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <p className="font-display text-[22px] font-bold leading-none">
                    {c.start}
                    <span className="ml-1.5 font-sans text-[12px] font-medium text-ink/45">{c.durationMin} min</span>
                  </p>
                  <Intensity level={c.intensity} />
                </div>
                <button type="button" onClick={() => setOpenId(c.id)} className="mt-1 text-left">
                  <h3 className="truncate text-[16px] font-semibold">{c.name}</h3>
                  <p className="truncate text-[12.5px] text-ink/50">
                    {c.coach} · {c.studio}
                  </p>
                </button>
                <div className="mt-auto flex items-end gap-3 pt-2">
                  <div className="min-w-0 flex-1">
                    <p className={cn('mb-1.5 truncate text-[11.5px] font-semibold', spots.tone === 'hot' ? 'text-brand' : 'text-ink/50')}>
                      {past ? 'Class ended' : spots.label}
                    </p>
                    <Meter value={c.booked} max={c.capacity} tone={spots.tone === 'hot' ? 'brand' : 'ink'} />
                  </div>
                  {past ? (
                    <Button size="sm" variant="ghost" disabled className="text-ink/40">
                      Ended
                    </Button>
                  ) : booked ? (
                    <Button size="sm" variant="ink" onClick={() => setOpenId(c.id)}>
                      <Check className="size-4 text-brand" strokeWidth={3} /> Booked
                    </Button>
                  ) : spots.left <= 0 ? (
                    <Button size="sm" variant="ghost" onClick={() => notify(`Added to the ${c.name} waitlist`)}>
                      Waitlist
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setOpenId(c.id)}>
                      Book
                    </Button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {list.length === 0 && (
        <div className="mt-2">
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="No classes found"
            body="Try another day, time, or category."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setCategory('All')
                  setPart('all')
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      )}

      <BottomSheet
        open={!!open}
        onClose={() => setOpenId(null)}
        label={open ? `${open.name} details` : 'Class details'}
        footer={
          open && (
            <ClassSheetFooter
              booked={openBooked}
              full={open.booked >= open.capacity}
              past={isPast(open.dayOffset, open.start, now)}
              onBook={() => {
                bookClass(open.id)
                notify(`You’re in! Spot reserved for ${open.name}`)
                setOpenId(null)
              }}
              onCancel={() => {
                const b = bookings.find((x) => x.kind === 'class' && x.refId === open.id)
                if (b) cancel(b.id)
                notify(`${open.name} booking cancelled`)
                setOpenId(null)
              }}
              onWaitlist={() => {
                notify(`Added to the ${open.name} waitlist`)
                setOpenId(null)
              }}
            />
          )
        }
      >
        {open && (
          <>
            <SheetHero image={open.image} alt={open.name}>
              <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">{open.category}</span>
              <h2 className="mt-3 font-display text-[46px] font-extrabold uppercase leading-[0.85]">{open.name}</h2>
            </SheetHero>
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-2">
                <InfoTile icon={<CalendarDays className="size-3.5" />} label="Date" value={longDate(open.dayOffset)} />
                <InfoTile icon={<Clock className="size-3.5" />} label="Time" value={`${open.start}–${endTime(open.start, open.durationMin)}`} />
                <InfoTile icon={<MapPin className="size-3.5" />} label="Studio" value={open.studio} />
                <InfoTile icon={<User className="size-3.5" />} label="Coach" value={open.coach} />
              </div>

              <div className="rounded-[22px] border border-ink/8 p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">Availability</p>
                    <p className="mt-1 font-display text-[44px] font-extrabold leading-none">
                      {Math.max(0, open.capacity - open.booked)}
                      <span className="ml-1 font-sans text-[14px] font-medium text-ink/50">of {open.capacity} spots left</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">Intensity</p>
                    <Intensity level={open.intensity} className="mt-2 justify-end" />
                  </div>
                </div>
                <Meter value={open.booked} max={open.capacity} tone={open.capacity - open.booked <= 3 ? 'brand' : 'ink'} className="mt-3 h-2" />
              </div>

              <p className="flex gap-2 text-[12.5px] leading-relaxed text-ink/55">
                <Info className="mt-0.5 size-4 shrink-0" />
                Free cancellation up to 2 hours before class. Arrive 10 minutes early — late entry is closed after 5 minutes.
              </p>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  )
}

function ClassSheetFooter({
  booked,
  full,
  past,
  onBook,
  onCancel,
  onWaitlist,
}: {
  booked: boolean
  full: boolean
  past: boolean
  onBook: () => void
  onCancel: () => void
  onWaitlist: () => void
}) {
  if (past)
    return (
      <Button size="lg" variant="ghost" disabled className="w-full text-ink/40">
        This class has ended
      </Button>
    )
  if (booked)
    return (
      <div className="flex items-center gap-3">
        <span className="flex flex-1 items-center gap-2 text-[14px] font-semibold">
          <span className="grid size-7 place-items-center rounded-full bg-brand">
            <Check className="size-4" strokeWidth={3} />
          </span>
          You’re booked
        </span>
        <Button size="lg" variant="outline" onClick={onCancel}>
          Cancel booking
        </Button>
      </div>
    )
  if (full)
    return (
      <Button size="lg" variant="ink" className="w-full" onClick={onWaitlist}>
        Class full · Join waitlist
      </Button>
    )
  return (
    <Button size="lg" className="w-full" onClick={onBook}>
      Reserve my spot
    </Button>
  )
}

function Intensity({ level, className }: { level: 1 | 2 | 3; className?: string }) {
  return (
    <span className={cn('flex gap-0.5', className)} aria-label={`Intensity ${level} of 3`} role="img">
      {[1, 2, 3].map((i) => (
        <Zap key={i} className={cn('size-3.5', i <= level ? 'fill-brand text-brand' : 'text-ink/15')} strokeWidth={2.5} />
      ))}
    </span>
  )
}
