import type { Persona } from '../types'

const STORAGE_KEY = 'pj-la-serena-directorio-overlay'

export interface Overlay {
  edited: Record<string, Partial<Persona>>
  added: Persona[]
  deleted: string[]
}

function emptyOverlay(): Overlay {
  return { edited: {}, added: [], deleted: [] }
}

export function loadOverlay(): Overlay {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyOverlay()
    const parsed = JSON.parse(raw)
    return {
      edited: parsed.edited ?? {},
      added: parsed.added ?? [],
      deleted: parsed.deleted ?? [],
    }
  } catch {
    return emptyOverlay()
  }
}

function saveOverlay(overlay: Overlay): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay))
}

export function hasChanges(overlay: Overlay): boolean {
  return (
    Object.keys(overlay.edited).length > 0 || overlay.added.length > 0 || overlay.deleted.length > 0
  )
}

export function editPerson(overlay: Overlay, id: string, patch: Partial<Persona>): Overlay {
  const next: Overlay = { ...overlay, edited: { ...overlay.edited, [id]: patch } }
  saveOverlay(next)
  return next
}

export function addPerson(overlay: Overlay, persona: Persona): Overlay {
  const next: Overlay = { ...overlay, added: [...overlay.added, persona] }
  saveOverlay(next)
  return next
}

export function deletePerson(overlay: Overlay, id: string): Overlay {
  const next: Overlay = {
    ...overlay,
    deleted: overlay.deleted.includes(id) ? overlay.deleted : [...overlay.deleted, id],
    added: overlay.added.filter((p) => p.id !== id),
  }
  saveOverlay(next)
  return next
}

export function resetOverlay(): Overlay {
  const next = emptyOverlay()
  saveOverlay(next)
  return next
}

export function applyOverlay(basePeople: Persona[], overlay: Overlay): Persona[] {
  const deleted = new Set(overlay.deleted)
  const result: Persona[] = []
  for (const p of basePeople) {
    if (deleted.has(p.id)) continue
    const patch = overlay.edited[p.id]
    result.push(patch ? { ...p, ...patch } : p)
  }
  for (const p of overlay.added) {
    if (!deleted.has(p.id)) result.push(p)
  }
  return result
}
