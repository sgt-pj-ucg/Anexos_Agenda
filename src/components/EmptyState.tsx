import { SearchX } from 'lucide-react'

export function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
      <SearchX size={32} className="text-slate-300 dark:text-slate-600" />
      <p className="font-medium text-slate-600 dark:text-slate-300">
        {query ? `Sin resultados para "${query}"` : 'Sin resultados para este filtro'}
      </p>
      <p className="text-sm text-slate-400 dark:text-slate-500">
        Prueba con un nombre, cargo, tribunal o correo distinto.
      </p>
    </div>
  )
}
