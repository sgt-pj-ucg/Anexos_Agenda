import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { Persona } from '../types'
import { avatarPalette, initials } from '../lib/format'

export function OrganigramaCard({ persona, draggable }: { persona: Persona; draggable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: persona.id,
    disabled: !draggable,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...(draggable ? { ...attributes, ...listeners } : {})}
      className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm transition-opacity dark:border-slate-800 dark:bg-slate-900 ${
        draggable ? 'cursor-grab touch-none active:cursor-grabbing' : ''
      } ${isDragging ? 'opacity-30' : ''}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarPalette(persona.id)}`}
      >
        {initials(persona.nombre)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
          {persona.nombre}
        </p>
        {persona.cargo && (
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{persona.cargo}</p>
        )}
      </div>
      {draggable && <GripVertical size={13} className="shrink-0 text-slate-300 dark:text-slate-600" />}
    </div>
  )
}
