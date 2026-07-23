import { useDroppable } from '@dnd-kit/core'
import { Users } from 'lucide-react'
import type { Persona } from '../types'
import { OrganigramaCard } from './OrganigramaCard'

export function OrganigramaColumn({
  unidad,
  people,
  isAdmin,
}: {
  unidad: string
  people: Persona[]
  isAdmin: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: unidad })

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-2xl border p-3 transition-colors ${
        isOver
          ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-500/10'
          : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40'
      }`}
    >
      <div className="mb-2 flex items-center gap-1.5 px-0.5">
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {unidad}
        </h3>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <Users size={10} /> {people.length}
        </span>
      </div>
      <div className="flex min-h-[3rem] flex-col gap-1.5">
        {people.map((p) => (
          <OrganigramaCard key={p.id} persona={p} draggable={isAdmin} />
        ))}
        {people.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 py-4 text-center text-[11px] text-slate-400 dark:border-slate-700 dark:text-slate-600">
            Sin funcionarios
          </p>
        )}
      </div>
    </div>
  )
}
