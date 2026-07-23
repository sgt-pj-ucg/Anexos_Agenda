import { useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import type { Persona } from '../types'
import { OrganigramaColumn } from './OrganigramaColumn'
import { OrganigramaCard } from './OrganigramaCard'

export function OrganigramaBoard({
  people,
  isAdmin,
  onMove,
}: {
  people: Persona[]
  isAdmin: boolean
  onMove: (personId: string, nuevaUnidad: string) => Promise<void>
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // Se recuerdan todas las unidades vistas alguna vez en esta sesión para
  // que, si un administrador deja una unidad sin nadie (ej. movió a todos
  // fuera de "Presidencia"), la columna siga existiendo y se pueda arrastrar
  // a alguien de vuelta — en vez de que desaparezca por quedar vacía.
  const knownUnidades = useRef<string[]>([])

  const columns = useMemo(() => {
    const map = new Map<string, Persona[]>()
    for (const p of people) {
      if (!map.has(p.unidad)) map.set(p.unidad, [])
      map.get(p.unidad)!.push(p)
    }
    for (const unidad of map.keys()) {
      if (!knownUnidades.current.includes(unidad)) knownUnidades.current.push(unidad)
    }
    return knownUnidades.current.map((unidad) => [unidad, map.get(unidad) ?? []] as [string, Persona[]])
  }, [people])

  const activePersona = activeId ? people.find((p) => p.id === activeId) : undefined

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const personId = active.id as string
    const nuevaUnidad = over.id as string
    const persona = people.find((p) => p.id === personId)
    if (!persona || persona.unidad === nuevaUnidad) return
    try {
      await onMove(personId, nuevaUnidad)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo mover al funcionario.')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-3">
        {columns.map(([unidad, gente]) => (
          <OrganigramaColumn key={unidad} unidad={unidad} people={gente} isAdmin={isAdmin} />
        ))}
      </div>
      <DragOverlay>
        {activePersona ? <OrganigramaCard persona={activePersona} draggable={false} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
