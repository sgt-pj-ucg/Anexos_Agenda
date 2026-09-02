import { ArrowRight } from 'lucide-react'
import { SECTION_META, SECTION_ORDER, type SeccionKey } from '../lib/sections'
import { GroupEmailButton } from './GroupEmailButton'
import type { Persona } from '../types'

export function SectionOverview({
  counts,
  peopleBySection,
  onSelect,
}: {
  counts: Record<string, number>
  peopleBySection: Partial<Record<SeccionKey, Persona[]>>
  onSelect: (s: SeccionKey) => void
}) {
  const items = SECTION_ORDER.filter((k) => k !== 'todos')
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((key) => {
        const meta = SECTION_META[key]
        const Icon = meta.icon
        const groupPeople = peopleBySection[key]
        return (
          <div
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(key)
            }}
            className="group relative flex cursor-pointer flex-col items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_18px_34px_-16px_rgba(79,70,229,.45)] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-700"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] scale-x-0 bg-gradient-to-r from-indigo-500 to-violet-500 transition-transform duration-300 group-hover:scale-x-100" />
            <div className="flex w-full items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-[0_8px_16px_-6px_rgba(79,70,229,.55)] transition-transform group-hover:scale-105 dark:from-indigo-500 dark:to-indigo-800">
                <Icon size={19} />
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                {counts[key] ?? 0}
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{meta.label}</p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-300">{meta.description}</p>
            </div>
            {groupPeople && (
              <div onClick={(e) => e.stopPropagation()}>
                <GroupEmailButton people={groupPeople} />
              </div>
            )}
            <span className="mt-auto flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-50 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-indigo-400">
              Explorar <ArrowRight size={14} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
