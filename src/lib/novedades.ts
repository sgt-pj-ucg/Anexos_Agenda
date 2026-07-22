const STORAGE_KEY = 'pj-la-serena-directorio-novedades-vistas'

export function getLastSeen(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function markSeen(timestamp: string): void {
  localStorage.setItem(STORAGE_KEY, timestamp)
}
