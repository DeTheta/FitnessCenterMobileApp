import { hash, unsplash } from '@/lib/utils'
import type { Trainer, TrainerSlot } from './types'

const SLOT_TIMES = ['07:00', '08:00', '10:00', '12:00', '15:00', '17:00', '18:00', '19:00']

function makeSlots(trainerId: string): TrainerSlot[] {
  const slots: TrainerSlot[] = []
  for (let day = 0; day < 7; day++) {
    for (const time of SLOT_TIMES) {
      const id = `${trainerId}-${day}-${time}`
      const h = hash(id)
      if (h % 4 === 0) continue // trainer not working this hour
      slots.push({ id, dayOffset: day, time, taken: h % 3 === 0 })
    }
  }
  return slots
}

type Seed = Omit<Trainer, 'slots'>

const SEEDS: Seed[] = [
  {
    id: 't-marcus',
    name: 'Marcus Cole',
    specialty: 'Strength & Hypertrophy',
    bio: 'Former competitive powerlifter who turns big lifts into simple, repeatable habits. Best for building real strength and muscle.',
    clients: 140,
    tags: ['Strength', 'Powerlifting'],
    rating: 4.9,
    years: 9,
    image: unsplash('1765045768265-e3eb8471fce3', 500),
    weeklyQuota: 12,
    bookedThisWeek: 9,
    onFloor: true,
  },
  {
    id: 't-maya',
    name: 'Maya Chen',
    specialty: 'HIIT & Fat Loss',
    bio: 'High-energy sessions built around smart intervals and sustainable nutrition. Ideal if you want results without burnout.',
    clients: 210,
    tags: ['Weight Loss', 'Conditioning'],
    rating: 4.8,
    years: 6,
    image: unsplash('1683848644078-f339179c4ff6', 500),
    weeklyQuota: 10,
    bookedThisWeek: 6,
    onFloor: true,
  },
  {
    id: 't-sofia',
    name: 'Sofia Park',
    specialty: 'Mobility & Rehab',
    bio: 'Certified physio coach helping members return from injury and move pain-free. Calm, precise, and evidence-led.',
    clients: 180,
    tags: ['Mobility', 'Rehab'],
    rating: 5.0,
    years: 11,
    image: unsplash('1548690312-e3b507d8c110', 500),
    weeklyQuota: 8,
    bookedThisWeek: 8,
    onFloor: false,
  },
  {
    id: 't-dante',
    name: 'Dante Brooks',
    specialty: 'Boxing & Conditioning',
    bio: 'Amateur boxing champion teaching technique, footwork, and the engine to go the distance. Every level welcome.',
    clients: 95,
    tags: ['Boxing', 'Conditioning'],
    rating: 4.9,
    years: 7,
    image: unsplash('1606335544053-c43609e6155d', 500),
    weeklyQuota: 10,
    bookedThisWeek: 4,
    onFloor: true,
  },
  {
    id: 't-lena',
    name: 'Lena Hart',
    specialty: 'Pilates & Core',
    bio: 'Reformer and mat specialist focused on posture, core control, and long-term joint health.',
    clients: 120,
    tags: ['Mobility', 'Weight Loss'],
    rating: 4.8,
    years: 5,
    image: unsplash('1683889842937-bfd75dbc4a81', 500),
    weeklyQuota: 10,
    bookedThisWeek: 8,
    onFloor: false,
  },
  {
    id: 't-jordan',
    name: 'Jordan Reyes',
    specialty: 'Athletic Performance',
    bio: 'Speed, power, and agility coach for athletes and weekend warriors who want to perform at their peak.',
    clients: 75,
    tags: ['Strength', 'Conditioning'],
    rating: 4.7,
    years: 5,
    image: unsplash('1628935291759-bbaf33a66dc6', 500),
    weeklyQuota: 12,
    bookedThisWeek: 3,
    onFloor: false,
  },
]

export const TRAINER_SPECIALTIES = ['All', 'Strength', 'Weight Loss', 'Conditioning', 'Mobility', 'Boxing', 'Rehab']

export const SEED_TRAINERS: Trainer[] = SEEDS.map((t) => ({ ...t, slots: makeSlots(t.id) }))
