export type ClassCategory = 'Strength' | 'HIIT' | 'Cycle' | 'Yoga' | 'Boxing' | 'Pilates'

export type ClassSession = {
  id: string
  name: string
  category: ClassCategory
  dayOffset: number
  start: string
  durationMin: number
  intensity: 1 | 2 | 3
  coach: string
  studio: string
  capacity: number
  booked: number
  image: string
}

export type TrainerSlot = { id: string; dayOffset: number; time: string; taken: boolean }

export type Trainer = {
  id: string
  name: string
  specialty: string
  bio: string
  clients: number
  tags: string[]
  rating: number
  years: number
  image: string
  weeklyQuota: number
  bookedThisWeek: number
  onFloor: boolean
  slots: TrainerSlot[]
}

export type WorkoutCategory = 'Strength' | 'Cardio' | 'Mobility' | 'Core' | 'Full Body'
export type Level = 'Beginner' | 'Intermediate' | 'Advanced'

export type Exercise = { name: string; sets: number; reps: string; restSec: number }

export type WorkoutProgram = {
  id: string
  title: string
  category: WorkoutCategory
  level: Level
  weeks: number
  sessionsPerWeek: number
  minutes: number
  image: string
  featured?: boolean
  description: string
  exercises: Exercise[]
}

export type Booking = {
  id: string
  kind: 'class' | 'trainer'
  refId: string
  slotId?: string
  dayOffset: number
  time: string
  durationMin: number
  title: string
  subtitle: string
  location: string
  image: string
}
