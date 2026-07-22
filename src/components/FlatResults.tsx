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
  onReportPerson?: (p: Persona) => void
  isFavorite?: (id: string) => boolean
  onToggleFavorite?: (id: string) => void
}

export function FlatResults({
  people,
  onEditPerson,
  onDeletePerson,
  onReportPerson,
  isFavorite,
  onToggleFavorite,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {people.map((p) => (
        <PersonCard
          key={p.id}
          p={p}
          contextTag={contextTagFor(p)}
          onEdit={onEditPerson ? () => onEditPerson(p) : undefined}
          onDelete={onDeletePerson ? () => onDeletePerson(p) : undefined}
          onReport={onReportPerson ? () => onReportPerson(p) : undefined}
          isFavorite={isFavorite?.(p.id)}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(p.id) : undefined}
        />
      ))}
    </div>
  )
}
