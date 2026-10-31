import { useState, type ReactNode } from 'react'
import { ArrowUpRight, Bell, CalendarDays, CalendarPlus, Clock, Dumbbell, Flame, MapPin, QrCode, Users, X } from 'lucide-react'
import { BottomSheet } from '@/components/BottomSheet'
import type { Tab } from '@/components/TabBar'
import { Button, EmptyState, Photo, SectionTitle } from '@/components/ui'
import { Wordmark } from '@/components/Wordmark'
import type { Booking } from '@/data/types'
import { USER } from '@/data/user'
import { WORKOUTS } from '@/data/workouts'
import { countdown, dayLabel, dayNumber, endTime, greeting, longDate, startDate, useNow, weekdayShort } from '@/lib/dates'
import { cn, hash } from '@/lib/utils'
import { useBooking } from '@/state/BookingContext'

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DONE_DAYS = new Set([0, 1, 3, 4, 5])

export function HomeScreen({ onNavigate, onOpenWorkout }: { onNavigate: (t: Tab) => void; onOpenWorkout: (id: string) => void }) {
  const now = useNow()
  const { sortedBookings, cancel, notify } = useBooking()
  const [manage, setManage] = useState<Booking | null>(null)
  const [passOpen, setPassOpen] = useState(false)

  const upcoming = sortedBookings.filter((b) => startDate(b.dayOffset, endTime(b.time, b.durationMin)) > now)
  const [next, ...rest] = upcoming
  const todayIdx = (now.getDay() + 6) % 7

  return (
    <div className="mb-[calc(max(16px,env(safe-area-inset-bottom))-24px)] pt-5 sm:mb-0">
      {/* Greeting header */}
      <header className="px-5 pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Photo src={USER.avatar} alt={`${USER.firstName} ${USER.lastName}`} className="size-11 rounded-full ring-2 ring-brand ring-offset-2" />
            <div>
              <p className="text-[16px] font-bold leading-tight">{USER.firstName} {USER.lastName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPassOpen(true)}
              aria-label="Open check-in pass"
              className="grid size-11 place-items-center rounded-full border border-ink/10 transition-colors hover:border-ink/40"
            >
              <QrCode className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => notify('You’re all caught up')}
              aria-label="Notifications, 1 new"
              className="relative grid size-11 place-items-center rounded-full border border-ink/10 transition-colors hover:border-ink/40"
            >
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand ring-2 ring-paper" />
            </button>
          </div>
        </div>

        <h1 className="mt-7 font-display text-[54px] font-extrabold uppercase leading-[0.84] tracking-tight">
          Ready to
          <br />
          <span className="italic text-brand">outwork</span> yesterday?
        </h1>
        <p className="mt-3 text-[13px] font-medium text-ink/50">{longDate()} · {USER.tier}</p>
      </header>

      {/* Weekly progress */}
      <section aria-label="This week" className="mx-5 mt-6 rounded-[28px] bg-ink p-5 text-white">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/50">This week</p>
          <p className="text-[12px] font-semibold text-white/70">
            {USER.week.workouts}/{USER.week.goal} goal
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 divide-x divide-white/10">
          <Stat value={USER.week.workouts} label="Workouts" />
          <Stat value={USER.week.minutes} label="Minutes" className="pl-4" />
          <Stat value={USER.week.streak} label="Day streak" className="pl-4" accent icon={<Flame className="size-4 fill-brand text-brand" />} />
        </div>
        <div className="mt-5 flex justify-between">
          {WEEK.map((d, i) => {
            const done = DONE_DAYS.has(i) && i < todayIdx
            const today = i === todayIdx
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'grid size-9 place-items-center rounded-full text-[12px] font-bold',
                    done && 'bg-brand text-ink',
                    !done && today && 'ring-2 ring-brand ring-inset text-white',
                    !done && !today && 'bg-white/8 text-white/40',
                  )}
                >
                  {done ? <Flame className="size-4" strokeWidth={2.5} /> : d}
                </span>
                <span className={cn('size-1 rounded-full', today ? 'bg-brand' : 'bg-transparent')} />
              </div>
            )
          })}
        </div>
      </section>

      {/* Next up */}
      <section className="mt-8">
        <SectionTitle title="Next up" action="Schedule" onAction={() => onNavigate('classes')} />
        {next ? (
          <article className="relative mx-5 h-[248px] overflow-hidden rounded-[28px] bg-ink text-white">
            <Photo src={next.image} alt="" className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
            <div className="absolute inset-x-5 top-5 flex items-center justify-between">
              <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
                {next.kind === 'class' ? 'Group class' : 'Personal training'}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-brand" />
                {countdown(startDate(next.dayOffset, next.time), now)}
              </span>
            </div>
            <div className="absolute inset-x-5 bottom-5">
              <h3 className="font-display text-[40px] font-extrabold uppercase leading-[0.9]">{next.title}</h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/75">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {dayLabel(next.dayOffset)} · {next.time}–{endTime(next.time, next.durationMin)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {next.location}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="glass" size="sm" onClick={() => setManage(next)}>
                  Manage
                </Button>
                <Button size="sm" onClick={() => setPassOpen(true)}>
                  <QrCode className="size-4" /> Check-in pass
                </Button>
              </div>
            </div>
          </article>
        ) : (
          <EmptyState
            icon={<CalendarPlus className="size-6" />}
            title="Nothing booked yet"
            body="Reserve a spot in a group class or grab a session with a trainer."
            action={
              <Button onClick={() => onNavigate('classes')}>
                Book a class <ArrowUpRight className="size-4" />
              </Button>
            }
          />
        )}

        {rest.length > 0 && (
          <ul className="mx-5 mt-3 space-y-2">
            {rest.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setManage(b)}
                  className="flex w-full items-center gap-4 rounded-[22px] border border-ink/8 p-3 text-left transition-colors hover:border-ink/25"
                >
                  <span className={cn('flex h-14 w-12 flex-col items-center justify-center rounded-[16px]', b.kind === 'class' ? 'bg-mist' : 'bg-brand')}>
                    <span className="text-[10px] font-bold uppercase text-ink/55">{weekdayShort(b.dayOffset)}</span>
                    <span className="font-display text-[22px] font-bold leading-none">{dayNumber(b.dayOffset)}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{b.title}</span>
                    <span className="block truncate text-[12.5px] text-ink/50">
                      {b.time} · {b.location}
                    </span>
                  </span>
                  <span className="rounded-full bg-mist px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink/60">
                    {b.kind === 'class' ? 'Class' : 'PT'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-8" aria-label="Quick actions">
        <SectionTitle title="Quick start" />
        <div className="grid grid-cols-2 gap-3 px-5">
          <QuickTile tone="brand" icon={<CalendarDays className="size-5" />} label="Book a class" sub="42 this week" onClick={() => onNavigate('classes')} />
          <QuickTile tone="ink" icon={<Users className="size-5" />} label="Find a trainer" sub="3 on the floor" onClick={() => onNavigate('trainers')} />
          <QuickTile tone="mist" icon={<Dumbbell className="size-5" />} label="Free workouts" sub={`${WORKOUTS.length} programs`} onClick={() => onNavigate('workouts')} />
          <QuickTile tone="mist" icon={<QrCode className="size-5" />} label="Check-in pass" sub="Scan at entry" onClick={() => setPassOpen(true)} />
        </div>
      </section>

      {/* Free programs */}
      <section className="mt-8">
        <SectionTitle title="Free programs" action="See all" onAction={() => onNavigate('workouts')} />
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5">
          {WORKOUTS.slice(0, 5).map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onOpenWorkout(w.id)}
              className="group relative h-[270px] w-[200px] shrink-0 snap-start overflow-hidden rounded-[24px] bg-ink text-left text-white"
            >
              <Photo src={w.image} alt="" className="absolute inset-0 h-full w-full" imgClassName="transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-paper px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">{w.level}</span>
              <div className="absolute inset-x-4 bottom-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">{w.category}</p>
                <p className="mt-1 font-display text-[24px] font-bold uppercase leading-[0.95]">{w.title}</p>
                <p className="mt-1.5 text-[12px] text-white/65">
                  {w.minutes} min · {w.weeks} weeks
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <BottomSheet open={!!manage} onClose={() => setManage(null)} label="Manage booking" footer={manage && (
        <div className="flex gap-2">
          <Button variant="outline" size="lg" className="flex-1" onClick={() => setManage(null)}>
            Keep it
          </Button>
          <Button
            variant="ink"
            size="lg"
            className="flex-1"
            onClick={() => {
              cancel(manage.id)
              notify(`${manage.title} cancelled`)
              setManage(null)
            }}
          >
            <X className="size-4" /> Cancel booking
          </Button>
        </div>
      )}>
        {manage && (
          <div className="px-5 pb-4 pt-12">
            <div className="flex items-center gap-4">
              <Photo src={manage.image} alt="" className="size-20 rounded-[20px]" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">{manage.kind === 'class' ? 'Group class' : 'Personal training'}</p>
                <p className="font-display text-[30px] font-extrabold uppercase leading-none">{manage.title}</p>
                <p className="mt-1 text-[13px] text-ink/55">{manage.subtitle}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 rounded-[22px] bg-mist p-4 text-[14px]">
              <p className="flex items-center gap-2"><CalendarDays className="size-4 text-ink/45" /> {longDate(manage.dayOffset)}</p>
              <p className="flex items-center gap-2"><Clock className="size-4 text-ink/45" /> {manage.time}–{endTime(manage.time, manage.durationMin)}</p>
              <p className="flex items-center gap-2"><MapPin className="size-4 text-ink/45" /> {manage.location}</p>
            </div>
            <p className="mt-4 text-[12.5px] text-ink/50">Free cancellation up to 2 hours before the start time.</p>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={passOpen} onClose={() => setPassOpen(false)} label="Check-in pass">
        <div className="flex flex-col items-center px-6 pb-10 pt-12 text-center">
          <Wordmark className="text-[28px]" />
          <p className="mt-1 text-[13px] text-ink/50">Hold the code up to the scanner at the turnstile</p>
          <div className="mt-6 rounded-[28px] bg-ink p-5">
            <QrPattern seed={USER.memberId} />
          </div>
          <p className="mt-5 font-display text-[28px] font-bold uppercase leading-none">
            {USER.firstName} {USER.lastName}
          </p>
          <p className="mt-1 text-[13px] font-medium tracking-wider text-ink/50">{USER.memberId} · {USER.tier}</p>
        </div>
      </BottomSheet>
    </div>
  )
}

function Stat({ value, label, accent, icon, className }: { value: number; label: string; accent?: boolean; icon?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className={cn('flex items-center gap-1 font-display text-[40px] font-extrabold leading-none', accent && 'text-brand')}>
        {value}
        {icon}
      </p>
      <p className="mt-1 text-[12px] font-medium text-white/55">{label}</p>
    </div>
  )
}

function QuickTile({
  tone,
  icon,
  label,
  sub,
  onClick,
}: {
  tone: 'brand' | 'ink' | 'mist'
  icon: ReactNode
  label: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-[118px] flex-col justify-between rounded-[24px] p-4 text-left transition-transform active:scale-[0.97]',
        tone === 'brand' && 'bg-brand text-ink',
        tone === 'ink' && 'bg-ink text-white',
        tone === 'mist' && 'bg-mist text-ink',
      )}
    >
      <span className="flex w-full items-center justify-between">
        {icon}
        <ArrowUpRight className="size-4 opacity-60" />
      </span>
      <span>
        <span className="block font-display text-[22px] font-bold uppercase leading-none">{label}</span>
        <span className={cn('mt-1 block text-[12px] font-medium', tone === 'ink' ? 'text-white/55' : 'text-ink/55')}>{sub}</span>
      </span>
    </button>
  )
}

function QrPattern({ seed }: { seed: string }) {
  const size = 25
  const finder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7
    const box = inBox(0, 0) ? [0, 0] : inBox(0, size - 7) ? [0, size - 7] : inBox(size - 7, 0) ? [size - 7, 0] : null
    if (!box) return null
    const y = r - box[0]
    const x = c - box[1]
    const ring = y === 0 || y === 6 || x === 0 || x === 6
    const core = y >= 2 && y <= 4 && x >= 2 && x <= 4
    return ring || core
  }
  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${size}, 7px)` }} aria-label="Member QR code" role="img">
      {Array.from({ length: size * size }, (_, i) => {
        const r = Math.floor(i / size)
        const c = i % size
        const f = finder(r, c)
        const on = f ?? hash(`${seed}-${r}-${c}`) % 2 === 0
        return <span key={i} className={cn('size-[7px] rounded-[1.5px]', on ? (f ? 'bg-brand' : 'bg-white') : 'bg-transparent')} />
      })}
    </div>
  )
}
