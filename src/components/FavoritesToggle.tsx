import { Star } from 'lucide-react'

export function FavoritesToggle({
  active,
  count,
  onClick,
}: {
  active: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={active ? 'Volver a la agenda completa' : 'Ver solo mis favoritos'}
      className={`flex shrink-0 items-center gap-1.5 rounded-2xl border px-4 text-sm font-medium transition-colors ${
        active
          ? 'border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300'
          : 'border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:text-amber-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
      }`}
    >
      <Star size={18} className={active ? 'fill-amber-500' : ''} />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
