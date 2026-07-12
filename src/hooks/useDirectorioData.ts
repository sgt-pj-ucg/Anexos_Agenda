import { useMemo, useState } from 'react'
import { directorio } from '../data'
import type { Persona } from '../types'
import {
  addPerson,
  applyOverlay,
  deletePerson,
  editPerson,
  hasChanges,
  loadOverlay,
  resetOverlay,
  type Overlay,
} from '../lib/editStore'
import { slugify } from '../lib/normalize'

function uniqueId(base: string, existing: Set<string>): string {
  let id = slugify(base) || 'contacto'
  let n = 1
  while (existing.has(id)) {
    id = `${slugify(base)}-${n}`
    n += 1
  }
  return id
}

export function useDirectorioData() {
  const [overlay, setOverlay] = useState<Overlay>(() => loadOverlay())

  const people = useMemo(
    () => applyOverlay(directorio.people, overlay),
    [overlay],
  )

  const update = (patch: Partial<Persona>, id: string) => setOverlay(editPerson(overlay, id, patch))

  const create = (draft: Omit<Persona, 'id'>) => {
    const existing = new Set(people.map((p) => p.id))
    const id = uniqueId(`${draft.nombre}-${draft.unidad}`, existing)
    setOverlay(addPerson(overlay, { ...draft, id }))
  }

  const remove = (id: string) => setOverlay(deletePerson(overlay, id))

  const reset = () => setOverlay(resetOverlay())

  const exportData = () => {
    const data = {
      ...directorio,
      totalPersonas: people.length,
      people,
    }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'directorio.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    people,
    tribunales: directorio.tribunales,
    correoGeneralSeccion: directorio.correoGeneralSeccion,
    generatedAt: directorio.generatedAt,
    updatePerson: update,
    createPerson: create,
    deletePerson: remove,
    resetChanges: reset,
    exportData,
    hasChanges: hasChanges(overlay),
    changeCount:
      Object.keys(overlay.edited).length + overlay.added.length + overlay.deleted.length,
  }
}
