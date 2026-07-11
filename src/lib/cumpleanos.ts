import { normalize } from './normalize'

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

export function parseCumple(s: string | null): { day: number; month: number } | null {
  if (!s) return null
  const m = normalize(s).match(/(\d{1,2})\s+de\s+([a-z]+)/)
  if (!m) return null
  const day = parseInt(m[1], 10)
  const month = MESES.indexOf(m[2])
  if (month === -1 || day < 1 || day > 31) return null
  return { day, month: month + 1 }
}

export function isToday(s: string | null, now: Date = new Date()): boolean {
  const c = parseCumple(s)
  if (!c) return false
  return c.day === now.getDate() && c.month === now.getMonth() + 1
}
