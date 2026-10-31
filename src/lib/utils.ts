export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function unsplash(id: string, w = 800) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`
}

/** Small deterministic hash so mock data is stable across reloads. */
export function hash(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}
