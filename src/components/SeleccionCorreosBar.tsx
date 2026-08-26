import { Check, Copy, Send, X } from 'lucide-react'
import { buildGroupMailto } from '../lib/mailto'
import { useCopy } from '../hooks/useCopy'

export function SeleccionCorreosBar({
  correos,
  onLimpiar,
}: {
  correos: string[]
  onLimpiar: () => void
}) {
  const { copied, copy } = useCopy()
  if (correos.length === 0) return null
  const joined = correos.join(', ')

  return (
    <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
      <div className="animate-fade-in flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
          {correos.length} {correos.length === 1 ? 'seleccionado' : 'seleccionados'}
        </span>
        <button
          type="button"
          onClick={onLimpiar}
          title="Limpiar selección"
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <X size={14} />
        </button>
        <button
          type="button"
          onClick={() => copy(joined)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {copied === joined ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          Copiar direcciones
        </button>
        <a
          href={buildGroupMailto(correos)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Send size={15} />
          Enviar correo ({correos.length})
        </a>
      </div>
    </div>
  )
}
