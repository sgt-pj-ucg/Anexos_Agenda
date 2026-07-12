import type { Persona } from '../types'
import { PersonCard } from './PersonCard'

function contextTagFor(p: Persona): string {
  if (p.seccion === 'tribunal' && p.comuna) return `${p.unidad} · ${p.comuna}`
  return p.unidad
}

interface Props {
  people: Persona[]
  onEditPerson?: (p: Persona) => void
  onDeletePerson?: (p: Persona) => void
}

export function FlatResults({ people, onEditPerson, onDeletePerson }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {people.map((p) => (
        <PersonCard
          key={p.id}
          p={p}
          contextTag={contextTagFor(p)}
          onEdit={onEditPerson ? () => onEditPerson(p) : undefined}
          onDelete={onDeletePerson ? () => onDeletePerson(p) : undefined}
        />
      ))}
    </div>
  )
}
