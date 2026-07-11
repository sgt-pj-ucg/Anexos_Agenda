import type { Persona } from '../types'
import { PersonCard } from './PersonCard'

function contextTagFor(p: Persona): string {
  if (p.seccion === 'tribunal' && p.comuna) return `${p.unidad} · ${p.comuna}`
  return p.unidad
}

export function FlatResults({ people }: { people: Persona[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {people.map((p) => (
        <PersonCard key={p.id} p={p} contextTag={contextTagFor(p)} />
      ))}
    </div>
  )
}
