import { ChevronDown, ChevronRight, Users } from 'lucide-react'
import { useState } from 'react'
import type { FichaTribunal, Persona } from '../types'
import { PersonCard } from './PersonCard'
import { TribunalFichaCard } from './TribunalFichaCard'
import { GroupEmailButton } from './GroupEmailButton'

export interface Group {
  key: string
  label: string
  people: Persona[]
  ficha: FichaTribunal | null
}

export function GroupedResults({ groups, collapsible }: { groups: Group[]; collapsible: boolean }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(collapsible ? groups.filter((g) => g.people.length > 8).map((g) => g.key) : []),
  )

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const isCollapsed = collapsible && collapsed.has(g.key)
        return (
          <section key={g.key} className="animate-fade-in">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {collapsible ? (
                <button
                  onClick={() => toggle(g.key)}
                  className="flex items-center gap-1.5 text-left"
                  title={isCollapsed ? 'Mostrar personal' : 'Ocultar personal'}
                >
                  {isCollapsed ? (
                    <ChevronRight size={16} className="shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="shrink-0 text-slate-400" />
                  )}
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{g.label}</h3>
                </button>
              ) : (
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{g.label}</h3>
              )}
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Users size={11} /> {g.people.length}
              </span>
              <GroupEmailButton people={g.people} />
            </div>
            {g.ficha && (
              <div className="mb-3">
                <TribunalFichaCard ficha={g.ficha} />
              </div>
            )}
            {!isCollapsed && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {g.people.map((p) => (
                  <PersonCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
