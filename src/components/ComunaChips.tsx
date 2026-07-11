import { MapPin } from 'lucide-react'

function chipClass(active: boolean) {
  return `rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
    active
      ? 'border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300'
      : 'border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:text-amber-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
  }`
}

export function ComunaChips({
  comunas,
  active,
  onChange,
  counts,
}: {
  comunas: string[]
  active: string | null
  onChange: (c: string | null) => void
  counts: Record<string, number>
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 flex items-center gap-1 text-xs font-medium text-slate-400">
        <MapPin size={12} /> Comuna:
      </span>
      <button onClick={() => onChange(null)} className={chipClass(active === null)}>
        Todas
      </button>
      {comunas.map((c) => (
        <button key={c} onClick={() => onChange(c)} className={chipClass(active === c)}>
          {c} <span className="opacity-60">({counts[c] ?? 0})</span>
        </button>
      ))}
    </div>
  )
}
