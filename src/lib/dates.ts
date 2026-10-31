import { useEffect, useState } from 'react'

export const DAYS = [0, 1, 2, 3, 4, 5, 6]

export function dateFor(offset: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return d
}

export function startDate(offset: number, time: string) {
  const d = dateFor(offset)
  const [h, m] = time.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d
}

export function isPast(offset: number, time: string, now: Date) {
  return startDate(offset, time).getTime() <= now.getTime()
}

export function weekdayShort(offset: number) {
  return dateFor(offset).toLocaleDateString('en-US', { weekday: 'short' })
}

export function dayNumber(offset: number) {
  return dateFor(offset).getDate()
}

export function dayLabel(offset: number) {
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'
  return dateFor(offset).toLocaleDateString('en-US', { weekday: 'long' })
}

export function longDate(offset = 0) {
  return dateFor(offset).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function shortDate(offset: number) {
  return dateFor(offset).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function endTime(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export type DayPart = 'morning' | 'afternoon' | 'evening'
export function dayPart(time: string): DayPart {
  const h = Number(time.split(':')[0])
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export function greeting(now: Date) {
  const h = now.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function countdown(target: Date, now: Date) {
  const mins = Math.round((target.getTime() - now.getTime()) / 60000)
  if (mins <= 0) return 'Happening now'
  if (mins < 60) return `Starts in ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Starts in ${hours}h ${mins % 60}m`
  const days = Math.round(hours / 24)
  return `In ${days} day${days > 1 ? 's' : ''}`
}

export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
