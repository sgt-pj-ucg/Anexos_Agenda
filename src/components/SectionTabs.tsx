import type { ReactNode } from 'react'
import { SECTION_META, SECTION_ORDER, type SeccionKey } from '../lib/sections'

export function SectionTabs({
  active,
  onChange,
  counts,
  trailing,
}: {
  active: SeccionKey
  onChange: (s: SeccionKey) => void
  counts: Record<string, number>
  trailing?: ReactNode
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SECTION_ORDER.map((key) => {
        const meta = SECTION_META[key]
        const Icon = meta.icon
        const isActive = key === active
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
              isActive
                ? 'scale-[1.03] border-indigo-600 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_8px_20px_-8px_rgba(99,102,241,.7)]'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-900 dark:hover:bg-indigo-500/10'
            }`}
          >
            <Icon size={15} />
            {meta.short}
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                isActive
                  ? 'bg-white/25'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {counts[key] ?? 0}
            </span>
          </button>
        )
      })}
      {trailing}
    </div>
  )
}
