import { SECTION_META, SECTION_ORDER, type SeccionKey } from '../lib/sections'

export function SectionTabs({
  active,
  onChange,
  counts,
}: {
  active: SeccionKey
  onChange: (s: SeccionKey) => void
  counts: Record<string, number>
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SECTION_ORDER.map((key) => {
        const meta = SECTION_META[key]
        const Icon = meta.icon
        const isActive = key === active
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-900'
            }`}
          >
            <Icon size={15} />
            {meta.short}
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[11px] ${
                isActive
                  ? 'bg-white/20'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {counts[key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}
