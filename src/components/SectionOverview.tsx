import { ArrowRight } from 'lucide-react'
import { SECTION_META, SECTION_ORDER, type SeccionKey } from '../lib/sections'

export function SectionOverview({
  counts,
  onSelect,
}: {
  counts: Record<string, number>
  onSelect: (s: SeccionKey) => void
}) {
  const items = SECTION_ORDER.filter((k) => k !== 'todos')
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((key) => {
        const meta = SECTION_META[key]
        const Icon = meta.icon
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Icon size={19} />
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {counts[key] ?? 0}
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{meta.label}</p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{meta.description}</p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
              Explorar <ArrowRight size={14} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
