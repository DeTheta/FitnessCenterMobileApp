import { useRef, useState } from 'react'
import { OVERLAY_ROOT_ID } from '@/components/BottomSheet'
import { PhoneFrame } from '@/components/PhoneFrame'
import { TABS, TabBar, type Tab } from '@/components/TabBar'
import { Toast } from '@/components/Toast'
import { Wordmark } from '@/components/Wordmark'
import { cn } from '@/lib/utils'
import { ClassesScreen } from '@/screens/ClassesScreen'
import { HomeScreen } from '@/screens/HomeScreen'
import { TrainersScreen } from '@/screens/TrainersScreen'
import { WorkoutDetailSheet } from '@/screens/WorkoutDetailSheet'
import { WorkoutsScreen } from '@/screens/WorkoutsScreen'
import { BookingProvider } from '@/state/BookingContext'

const BLURBS: Record<Tab, string> = {
  home: 'Greeting, weekly streak, next booking and quick access to free programs.',
  classes: 'Seven-day schedule with live spot counts and one-tap reservations.',
  trainers: 'Real-time weekly quotas and open slots for every personal trainer.',
  workouts: 'A library of free, member-only training programs.',
}

export default function App() {
  return (
    <BookingProvider>
      <Shell />
    </BookingProvider>
  )
}

function Shell() {
  const [tab, setTab] = useState<Tab>('home')
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const scroller = useRef<HTMLElement>(null)

  const go = (t: Tab) => {
    setTab(t)
    scroller.current?.scrollTo({ top: 0 })
  }

  const aside = (
    <aside className="hidden w-[300px] lg:block">
      <Wordmark className="text-[72px]" />
      <p className="mt-3 max-w-[260px] text-[15px] leading-relaxed text-ink/55">
        The member app for Optimum Plus — book classes, lock in trainers, and train free.
      </p>
      <nav aria-label="Screens" className="mt-10 space-y-1">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => go(t.id)}
            className={cn(
              'group flex w-full gap-4 rounded-[20px] p-4 text-left transition-colors',
              tab === t.id ? 'bg-paper shadow-sm' : 'hover:bg-paper/60',
            )}
          >
            <span className={cn('font-display text-[22px] font-bold leading-none', tab === t.id ? 'text-brand' : 'text-ink/25')}>
              0{i + 1}
            </span>
            <span>
              <span className="block font-display text-[22px] font-bold uppercase leading-none">{t.label}</span>
              <span className="mt-1 block text-[12.5px] leading-snug text-ink/50">{BLURBS[t.id]}</span>
            </span>
          </button>
        ))}
      </nav>
    </aside>
  )

  return (
    <PhoneFrame aside={aside}>
      <div className="relative flex h-full flex-col">
        <main
          ref={scroller}
          className="no-scrollbar flex-1 overflow-y-auto bg-paper pb-28 pt-[calc(env(safe-area-inset-top)+16px)] sm:pt-[50px]"
        >
          <div key={tab} className="animate-screen-in">
            {tab === 'home' && <HomeScreen onNavigate={go} onOpenWorkout={setWorkoutId} />}
            {tab === 'classes' && <ClassesScreen />}
            {tab === 'trainers' && <TrainersScreen />}
            {tab === 'workouts' && <WorkoutsScreen onOpenWorkout={setWorkoutId} />}
          </div>
        </main>
        <TabBar value={tab} onChange={go} />
        <div id={OVERLAY_ROOT_ID} className="pointer-events-none absolute inset-0 z-40" />
        <Toast />
        <WorkoutDetailSheet id={workoutId} onClose={() => setWorkoutId(null)} />
      </div>
    </PhoneFrame>
  )
}
