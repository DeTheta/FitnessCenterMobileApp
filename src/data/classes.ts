import { hash, unsplash } from '@/lib/utils'
import type { ClassCategory, ClassSession } from './types'

type Template = Omit<ClassSession, 'id' | 'dayOffset' | 'start' | 'booked'>

const TEMPLATES: Record<ClassCategory, Template> = {
  HIIT: {
    name: 'HIIT Blast',
    category: 'HIIT',
    durationMin: 45,
    intensity: 3,
    coach: 'Maya Chen',
    studio: 'Studio A',
    capacity: 20,
    image: unsplash('1517931524326-bdd55a541177'),
  },
  Cycle: {
    name: 'Power Cycle',
    category: 'Cycle',
    durationMin: 45,
    intensity: 3,
    coach: 'Jordan Reyes',
    studio: 'Cycle Lab',
    capacity: 24,
    image: unsplash('1520877880798-5ee004e3f11e'),
  },
  Strength: {
    name: 'Barbell Strength',
    category: 'Strength',
    durationMin: 60,
    intensity: 2,
    coach: 'Marcus Cole',
    studio: 'Performance Floor',
    capacity: 14,
    image: unsplash('1605296867724-fa87a8ef53fd'),
  },
  Yoga: {
    name: 'Flow Yoga',
    category: 'Yoga',
    durationMin: 60,
    intensity: 1,
    coach: 'Sofia Park',
    studio: 'Studio B',
    capacity: 18,
    image: unsplash('1683056255281-e52a141924f0'),
  },
  Boxing: {
    name: 'Box & Burn',
    category: 'Boxing',
    durationMin: 50,
    intensity: 3,
    coach: 'Dante Brooks',
    studio: 'Fight Zone',
    capacity: 16,
    image: unsplash('1651707999601-cba87015439c'),
  },
  Pilates: {
    name: 'Core Pilates',
    category: 'Pilates',
    durationMin: 45,
    intensity: 2,
    coach: 'Lena Hart',
    studio: 'Studio B',
    capacity: 12,
    image: unsplash('1747239069226-55382c570116'),
  },
}

const ORDER: ClassCategory[] = ['HIIT', 'Strength', 'Yoga', 'Cycle', 'Boxing', 'Pilates']
const TIMES = ['06:30', '07:30', '09:00', '12:15', '17:30', '18:30', '19:30']

export const CLASS_CATEGORIES: Array<'All' | ClassCategory> = ['All', ...ORDER]

export const SEED_CLASSES: ClassSession[] = Array.from({ length: 7 }, (_, day) =>
  TIMES.map((start, i) => {
    const template = TEMPLATES[ORDER[(day * 2 + i) % ORDER.length]]
    const id = `c-${day}-${start.replace(':', '')}`
    const h = hash(id)
    let booked = Math.floor(template.capacity * (0.35 + (h % 50) / 100))
    if (h % 6 === 0) booked = template.capacity
    else if (h % 5 === 0) booked = template.capacity - 1 - (h % 2)
    return { ...template, id, dayOffset: day, start, booked: Math.min(booked, template.capacity) }
  }),
).flat()
