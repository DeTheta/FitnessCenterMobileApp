import { useMemo, useState } from "react"
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Lock,
  MapPin,
  SearchX,
  Star,
  Timer,
} from "lucide-react"
import { BottomSheet, InfoTile } from "@/components/BottomSheet"
import { DateStrip } from "@/components/DateStrip"
import {
  Button,
  Chip,
  ChipRow,
  EmptyState,
  Photo,
  ScreenHeader,
  SearchField,
} from "@/components/ui"
import { TRAINER_SPECIALTIES } from "@/data/trainers"
import type { Trainer } from "@/data/types"
import { dayLabel, endTime, isPast, longDate, useNow } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { useBooking } from "@/state/BookingContext"

export function TrainersScreen() {
  const now = useNow()
  const { trainers, bookings, bookTrainer, notify } = useBooking()
  const [query, setQuery] = useState("")
  const [tag, setTag] = useState("All")
  const [day, setDay] = useState(0)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [confirm, setConfirm] = useState<{
    trainerId: string
    slotId: string
  } | null>(null)

  const onFloor = trainers.filter((t) => t.onFloor).length
  const markedDays = useMemo(
    () =>
      new Set(
        bookings.filter((b) => b.kind === "trainer").map((b) => b.dayOffset),
      ),
    [bookings],
  )

  const q = query.trim().toLowerCase()
  const list = trainers.filter(
    (t) =>
      (tag === "All" || t.tags.includes(tag)) &&
      (!q ||
        t.name.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q)),
  )

  const confirmTrainer = confirm
    ? trainers.find((t) => t.id === confirm.trainerId)
    : undefined
  const confirmSlot = confirmTrainer?.slots.find(
    (s) => s.id === confirm?.slotId,
  )

  return (
    <div>
      <ScreenHeader
        eyebrow="Personal training"
        title="Trainers"
        right={
          <span className="mb-1 flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-white">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-live rounded-full bg-brand" />
              <span className="relative size-2 rounded-full bg-brand" />
            </span>
            {onFloor} on the floor
          </span>
        }
      />

      <div className="space-y-4 px-5">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search trainers or goals"
        />
        <ChipRow>
          {TRAINER_SPECIALTIES.map((s) => (
            <Chip key={s} active={tag === s} onClick={() => setTag(s)}>
              {s}
            </Chip>
          ))}
        </ChipRow>
        <DateStrip
          value={day}
          onChange={(d) => {
            setDay(d)
            setSelected({})
          }}
          marked={markedDays}
        />
      </div>

      <section
        aria-label="Trainer profiles"
        className="-mb-28 mt-6 min-h-[50vh] rounded-t-[36px] bg-mist px-5 pb-32 pt-6"
      >
        <div className="space-y-6">
          {list.map((t) => (
            <TrainerCard
              key={t.id}
              trainer={t}
              day={day}
              now={now}
              selectedSlot={selected[t.id]}
              onSelect={(slotId) =>
                setSelected((s) => ({
                  ...s,
                  [t.id]: s[t.id] === slotId ? "" : slotId,
                }))
              }
              onBook={() =>
                selected[t.id] &&
                setConfirm({ trainerId: t.id, slotId: selected[t.id] })
              }
            />
          ))}
        </div>

        {list.length === 0 && (
          <div className="-mx-5">
            <EmptyState
              icon={<SearchX className="size-6" />}
              title="No trainers match"
              body="Try a different name or specialty."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("")
                    setTag("All")
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        )}
      </section>

      <BottomSheet
        open={!!confirmTrainer && !!confirmSlot}
        onClose={() => setConfirm(null)}
        label="Confirm training session"
        footer={
          confirmTrainer &&
          confirmSlot && (
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                bookTrainer(confirmTrainer.id, confirmSlot.id)
                notify(
                  `Session with ${confirmTrainer.name.split(" ")[0]} booked for ${confirmSlot.time}`,
                )
                setSelected((s) => ({ ...s, [confirmTrainer.id]: "" }))
                setConfirm(null)
              }}
            >
              Confirm session <ArrowRight className="size-4" />
            </Button>
          )
        }
      >
        {confirmTrainer && confirmSlot && (
          <div className="px-5 pb-5 pt-12">
            <div className="flex items-center gap-4">
              <Photo
                src={confirmTrainer.image}
                alt={confirmTrainer.name}
                className="h-24 w-20 rounded-[20px]"
              />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
                  1:1 Session
                </p>
                <p className="font-display text-[34px] font-extrabold uppercase leading-[0.9]">
                  {confirmTrainer.name}
                </p>
                <p className="mt-1 text-[13px] text-ink/55">
                  {confirmTrainer.specialty}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <InfoTile
                icon={<CalendarDays className="size-3.5" />}
                label="Date"
                value={longDate(confirmSlot.dayOffset)}
              />
              <InfoTile
                icon={<Clock className="size-3.5" />}
                label="Time"
                value={`${confirmSlot.time}–${endTime(confirmSlot.time, 60)}`}
              />
              <InfoTile
                icon={<Timer className="size-3.5" />}
                label="Length"
                value="60 minutes"
              />
              <InfoTile
                icon={<MapPin className="size-3.5" />}
                label="Meet at"
                value="Performance Floor"
              />
            </div>
            <div className="mt-3 rounded-[22px] bg-ink p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                Weekly quota after booking
              </p>
              <p className="mt-1 font-display text-[30px] font-bold leading-none">
                {confirmTrainer.bookedThisWeek + 1}
                <span className="text-white/40">
                  {" "}
                  / {confirmTrainer.weeklyQuota}
                </span>
              </p>
              <QuotaBar
                booked={confirmTrainer.bookedThisWeek + 1}
                quota={confirmTrainer.weeklyQuota}
                dark
                className="mt-3"
              />
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

function TrainerCard({
  trainer: t,
  day,
  now,
  selectedSlot,
  onSelect,
  onBook,
}: {
  trainer: Trainer
  day: number
  now: Date
  selectedSlot?: string
  onSelect: (slotId: string) => void
  onBook: () => void
}) {
  const left = t.weeklyQuota - t.bookedThisWeek
  const full = left <= 0
  const slots = t.slots.filter((s) => s.dayOffset === day)
  const openCount = slots.filter(
    (s) => !s.taken && !isPast(s.dayOffset, s.time, now),
  ).length
  const chosen = slots.find((s) => s.id === selectedSlot)

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[32px] border bg-paper transition-all duration-300 ease-out",
        "shadow-[0_1px_2px_rgba(10,10,10,0.06),0_18px_40px_-18px_rgba(10,10,10,0.28)] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(10,10,10,0.06),0_28px_56px_-20px_rgba(10,10,10,0.38)]",
        chosen ? "border-brand ring-2 ring-brand/30" : "border-ink/[0.07]",
      )}
    >
      {/* Portrait */}
      <div className="relative h-[300px] overflow-hidden bg-ink">
        <Photo
          src={t.image}
          alt={`Portrait of ${t.name}`}
          className="absolute inset-0 h-full w-full"
          imgClassName="object-[center_22%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-ink/30" />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between">
          {t.onFloor ? (
            <span className="flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink shadow-sm">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-live rounded-full bg-brand" />
                <span className="relative size-2 rounded-full bg-brand" />
              </span>
              On the floor
            </span>
          ) : (
            <span className="rounded-full bg-ink/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-md">
              Off shift
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-ink/60 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur-md">
            <Star className="size-3.5 fill-brand text-brand" />{" "}
            {t.rating.toFixed(1)}
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-1.5">
          {t.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/15 px-3 py-1 text-[11.5px] font-semibold text-white backdrop-blur-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Identity */}
      <div className="px-5 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
          {t.specialty}
        </p>
        <h3 className="mt-1.5 font-display text-[40px] font-extrabold uppercase leading-[0.88] tracking-tight text-ink">
          {t.name}
        </h3>
        <p className="mt-3 text-[14.5px] leading-[1.6] text-ink/65">{t.bio}</p>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-ink/8 border-y border-ink/8 py-3.5">
          <ProfileStat label="Experience" value={`${t.years}`} unit="yrs" />
          <ProfileStat label="Clients" value={`${t.clients}`} unit="+" />
          <ProfileStat label="Rating" value={t.rating.toFixed(1)} unit="/5" />
        </dl>
      </div>

      {/* Quota */}
      <div className="px-5 pt-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
              Weekly quota
            </p>
            <p
              className={cn(
                "mt-1 text-[13px] font-semibold",
                full ? "text-ink/50" : left <= 2 ? "text-brand" : "text-ink/70",
              )}
            >
              {full
                ? "Fully booked this week"
                : left <= 2
                  ? `Only ${left} session${left > 1 ? "s" : ""} left`
                  : `${left} sessions available`}
            </p>
          </div>
          <p className="font-display text-[34px] font-extrabold leading-none tabular-nums">
            {t.bookedThisWeek}
            <span className="text-[20px] text-ink/30">/{t.weeklyQuota}</span>
          </p>
        </div>
        <QuotaBar
          booked={t.bookedThisWeek}
          quota={t.weeklyQuota}
          className="mt-3"
        />
      </div>

      {/* Slots */}
      <div className="pt-5">
        <p className="px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
          {dayLabel(day)} ·{" "}
          {full
            ? "Unavailable"
            : `${openCount} open slot${openCount === 1 ? "" : "s"}`}
        </p>
        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-5">
          {slots.length === 0 && (
            <span className="py-2.5 text-[13px] text-ink/45">
              Not on schedule this day
            </span>
          )}
          {slots.map((s) => {
            const disabled = full || s.taken || isPast(s.dayOffset, s.time, now)
            const active = s.id === selectedSlot
            return (
              <button
                key={s.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(s.id)}
                aria-pressed={active}
                className={cn(
                  "h-11 shrink-0 rounded-full px-[18px] text-[14px] font-semibold tabular-nums transition-all active:scale-95",
                  active &&
                    "bg-brand text-ink shadow-[0_8px_18px_-8px_rgba(255,90,31,0.8)]",
                  !active &&
                    !disabled &&
                    "border border-ink/15 hover:border-ink",
                  disabled && "bg-mist text-ink/25 line-through",
                )}
              >
                {s.time}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-5">
        <Button
          size="lg"
          variant={chosen ? "brand" : "ink"}
          disabled={full || !chosen}
          onClick={onBook}
          className={cn("w-full", (full || !chosen) && "opacity-35")}
        >
          {full ? (
            <>
              <Lock className="size-4" /> Quota reached
            </>
          ) : chosen ? (
            <>
              Book {dayLabel(day)} · {chosen.time}{" "}
              <ArrowRight className="size-4" />
            </>
          ) : (
            "Select a time to book"
          )}
        </Button>
      </div>
    </article>
  )
}

function ProfileStat({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink/45">
        {label}
      </dt>
      <dd className="mt-1 font-display text-[28px] font-bold leading-none tabular-nums">
        {value}
        <span className="ml-0.5 text-[16px] text-ink/35">{unit}</span>
      </dd>
    </div>
  )
}

function QuotaBar({
  booked,
  quota,
  dark,
  className,
}: {
  booked: number
  quota: number
  dark?: boolean
  className?: string
}) {
  const left = quota - booked
  return (
    <div
      className={cn("flex gap-1", className)}
      role="img"
      aria-label={`${booked} of ${quota} sessions booked`}
    >
      {Array.from({ length: quota }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 flex-1 rounded-full transition-colors duration-500",
            i < booked
              ? left <= 2
                ? "bg-brand"
                : dark
                  ? "bg-white"
                  : "bg-ink"
              : dark
                ? "bg-white/15"
                : "bg-ink/10",
          )}
        />
      ))}
    </div>
  )
}
