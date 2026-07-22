import { Scale } from 'lucide-react'

function chipClass(active: boolean) {
  return `rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
    active
      ? 'border-indigo-400 bg-indigo-100 text-indigo-800 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-300'
      : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
  }`
}

export function MateriaChips({
  materias,
  active,
  onChange,
  counts,
}: {
  materias: string[]
  active: string | null
  onChange: (m: string | null) => void
  counts: Record<string, number>
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 flex items-center gap-1 text-xs font-medium text-slate-400">
        <Scale size={12} /> Materia:
      </span>
      <button onClick={() => onChange(null)} className={chipClass(active === null)}>
        Todas
      </button>
      {materias.map((m) => (
        <button key={m} onClick={() => onChange(m)} className={chipClass(active === m)}>
          {m} <span className="opacity-60">({counts[m] ?? 0})</span>
        </button>
      ))}
    </div>
  )
}
