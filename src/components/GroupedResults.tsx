import { ChevronDown, ChevronRight, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import type { FichaTribunal, Persona } from '../types'
import { PersonCard } from './PersonCard'
import { TribunalFichaCard } from './TribunalFichaCard'
import { GroupEmailButton } from './GroupEmailButton'
import { useIsAdmin } from '../context/RoleContext'

export interface Group {
  key: string
  label: string
  people: Persona[]
  ficha: FichaTribunal | null
}

interface Props {
  groups: Group[]
  collapsible: boolean
  onEditPerson?: (p: Persona) => void
  onDeletePerson?: (p: Persona) => void
  onAddPerson?: (group: Group) => void
  onEditFicha?: (ficha: FichaTribunal) => void
  onReportPerson?: (p: Persona) => void
  onReportFicha?: (ficha: FichaTribunal) => void
  isFavorite?: (id: string) => boolean
  onToggleFavorite?: (id: string) => void
}

export function GroupedResults({
  groups,
  collapsible,
  onEditPerson,
  onDeletePerson,
  onAddPerson,
  onEditFicha,
  onReportPerson,
  onReportFicha,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const isAdmin = useIsAdmin()
  // Los grupos colapsables (tribunales) empiezan siempre contraídos; solo se
  // registran aquí las excepciones que el usuario expandió a mano.
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const isCollapsed = collapsible && !expanded.has(g.key)
        return (
          <section key={g.key} className="animate-fade-in">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {collapsible ? (
                <button
                  onClick={() => toggle(g.key)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                    isCollapsed
                      ? 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-500/10'
                      : 'border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-500/10'
                  }`}
                  title={isCollapsed ? 'Mostrar personal' : 'Ocultar personal'}
                >
                  {isCollapsed ? (
                    <ChevronRight size={16} className="shrink-0 text-indigo-500" />
                  ) : (
                    <ChevronDown size={16} className="shrink-0 text-indigo-500" />
                  )}
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{g.label}</h3>
                  <span className="ml-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {isCollapsed ? 'Ver funcionarios' : 'Ocultar'}
                  </span>
                </button>
              ) : (
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{g.label}</h3>
              )}
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Users size={11} /> {g.people.length}
              </span>
              <GroupEmailButton people={g.people} />
              {isAdmin && onAddPerson && (
                <button
                  onClick={() => onAddPerson(g)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                >
                  <UserPlus size={12} />
                  Agregar contacto
                </button>
              )}
            </div>
            {g.ficha && (
              <div className="mb-3">
                <TribunalFichaCard
                  ficha={g.ficha}
                  onEdit={onEditFicha ? () => onEditFicha(g.ficha!) : undefined}
                  onReport={onReportFicha ? () => onReportFicha(g.ficha!) : undefined}
                />
              </div>
            )}
            {!isCollapsed && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {g.people.map((p) => (
                  <PersonCard
                    key={p.id}
                    p={p}
                    onEdit={onEditPerson ? () => onEditPerson(p) : undefined}
                    onDelete={onDeletePerson ? () => onDeletePerson(p) : undefined}
                    onReport={onReportPerson ? () => onReportPerson(p) : undefined}
                    isFavorite={isFavorite?.(p.id)}
                    onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(p.id) : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
