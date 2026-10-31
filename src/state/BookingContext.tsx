import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { SEED_CLASSES } from '@/data/classes'
import { SEED_TRAINERS } from '@/data/trainers'
import type { Booking, ClassSession, Trainer } from '@/data/types'
import { startDate } from '@/lib/dates'

type State = {
  classes: ClassSession[]
  trainers: Trainer[]
  bookings: Booking[]
  saved: string[]
  toast: { id: number; message: string } | null
}

type Action =
  | { type: 'BOOK_CLASS'; id: string }
  | { type: 'BOOK_TRAINER'; trainerId: string; slotId: string }
  | { type: 'CANCEL'; bookingId: string }
  | { type: 'TOGGLE_SAVE'; id: string }
  | { type: 'TOAST'; message: string }
  | { type: 'CLEAR_TOAST'; id: number }

function classBooking(c: ClassSession): Booking {
  return {
    id: `b-${c.id}`,
    kind: 'class',
    refId: c.id,
    dayOffset: c.dayOffset,
    time: c.start,
    durationMin: c.durationMin,
    title: c.name,
    subtitle: `with ${c.coach}`,
    location: c.studio,
    image: c.image,
  }
}

function trainerBooking(t: Trainer, slotId: string): Booking {
  const slot = t.slots.find((s) => s.id === slotId)!
  return {
    id: `b-${slotId}`,
    kind: 'trainer',
    refId: t.id,
    slotId,
    dayOffset: slot.dayOffset,
    time: slot.time,
    durationMin: 60,
    title: `PT with ${t.name.split(' ')[0]}`,
    subtitle: t.specialty,
    location: 'Performance Floor',
    image: t.image,
  }
}

function initialState(): State {
  const trainers = SEED_TRAINERS.map((t) => ({ ...t, slots: t.slots.map((s) => ({ ...s })) }))
  const bookings: Booking[] = []

  const seedClass = SEED_CLASSES.find((c) => c.id === 'c-1-0730')
  if (seedClass) bookings.push(classBooking(seedClass))

  const marcus = trainers.find((t) => t.id === 't-marcus')
  const slot = marcus?.slots.find((s) => s.dayOffset === 2 && s.time >= '17:00')
  if (marcus && slot) {
    slot.taken = true
    bookings.push(trainerBooking(marcus, slot.id))
  }

  return { classes: SEED_CLASSES.map((c) => ({ ...c })), trainers, bookings, saved: ['w-mobility'], toast: null }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'BOOK_CLASS': {
      const c = state.classes.find((x) => x.id === action.id)
      if (!c || c.booked >= c.capacity || state.bookings.some((b) => b.kind === 'class' && b.refId === c.id)) return state
      return {
        ...state,
        classes: state.classes.map((x) => (x.id === c.id ? { ...x, booked: x.booked + 1 } : x)),
        bookings: [...state.bookings, classBooking(c)],
      }
    }
    case 'BOOK_TRAINER': {
      const t = state.trainers.find((x) => x.id === action.trainerId)
      const slot = t?.slots.find((s) => s.id === action.slotId)
      if (!t || !slot || slot.taken || t.bookedThisWeek >= t.weeklyQuota) return state
      return {
        ...state,
        trainers: state.trainers.map((x) =>
          x.id === t.id
            ? {
                ...x,
                bookedThisWeek: x.bookedThisWeek + 1,
                slots: x.slots.map((s) => (s.id === slot.id ? { ...s, taken: true } : s)),
              }
            : x,
        ),
        bookings: [...state.bookings, trainerBooking(t, slot.id)],
      }
    }
    case 'CANCEL': {
      const b = state.bookings.find((x) => x.id === action.bookingId)
      if (!b) return state
      const bookings = state.bookings.filter((x) => x.id !== b.id)
      if (b.kind === 'class') {
        return {
          ...state,
          bookings,
          classes: state.classes.map((x) => (x.id === b.refId ? { ...x, booked: Math.max(0, x.booked - 1) } : x)),
        }
      }
      return {
        ...state,
        bookings,
        trainers: state.trainers.map((x) =>
          x.id === b.refId
            ? {
                ...x,
                bookedThisWeek: Math.max(0, x.bookedThisWeek - 1),
                slots: x.slots.map((s) => (s.id === b.slotId ? { ...s, taken: false } : s)),
              }
            : x,
        ),
      }
    }
    case 'TOGGLE_SAVE':
      return {
        ...state,
        saved: state.saved.includes(action.id) ? state.saved.filter((x) => x !== action.id) : [...state.saved, action.id],
      }
    case 'TOAST':
      return { ...state, toast: { id: Date.now(), message: action.message } }
    case 'CLEAR_TOAST':
      return state.toast?.id === action.id ? { ...state, toast: null } : state
  }
}

type ContextValue = State & {
  sortedBookings: Booking[]
  bookClass: (id: string) => void
  bookTrainer: (trainerId: string, slotId: string) => void
  cancel: (bookingId: string) => void
  toggleSave: (id: string) => void
  notify: (message: string) => void
}

const BookingContext = createContext<ContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => {
    if (!state.toast) return
    const id = state.toast.id
    const timer = window.setTimeout(() => dispatch({ type: 'CLEAR_TOAST', id }), 2600)
    return () => window.clearTimeout(timer)
  }, [state.toast])

  const bookClass = useCallback((id: string) => dispatch({ type: 'BOOK_CLASS', id }), [])
  const bookTrainer = useCallback((trainerId: string, slotId: string) => dispatch({ type: 'BOOK_TRAINER', trainerId, slotId }), [])
  const cancel = useCallback((bookingId: string) => dispatch({ type: 'CANCEL', bookingId }), [])
  const toggleSave = useCallback((id: string) => dispatch({ type: 'TOGGLE_SAVE', id }), [])
  const notify = useCallback((message: string) => dispatch({ type: 'TOAST', message }), [])

  const value = useMemo<ContextValue>(() => {
    const sortedBookings = [...state.bookings].sort(
      (a, b) => startDate(a.dayOffset, a.time).getTime() - startDate(b.dayOffset, b.time).getTime(),
    )
    return { ...state, sortedBookings, bookClass, bookTrainer, cancel, toggleSave, notify }
  }, [state, bookClass, bookTrainer, cancel, toggleSave, notify])

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider')
  return ctx
}
