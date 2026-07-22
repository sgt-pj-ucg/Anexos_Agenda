import { Bell, Landmark, Pencil, UserMinus, UserPlus, X, type LucideIcon } from 'lucide-react'
import type { Cambio } from '../types'
import { timeAgo } from '../lib/timeAgo'

const TIPO_META: Record<Cambio['tipo'], { label: (c: Cambio) => string; icon: LucideIcon; color: string }> = {
  persona_agregada: {
    label: (c) => `Se agregó a ${c.entidad}${c.detalle ? ` (${c.detalle})` : ''}`,
    icon: UserPlus,
    color: 'text-emerald-500',
  },
  persona_editada: {
    label: (c) => `Se editó a ${c.entidad}${c.detalle ? ` (${c.detalle})` : ''}`,
    icon: Pencil,
    color: 'text-indigo-500',
  },
  persona_eliminada: {
    label: (c) => `Se eliminó a ${c.entidad} del directorio`,
    icon: UserMinus,
    color: 'text-rose-500',
  },
  ficha_editada: {
    label: (c) => `Se actualizó la ficha de ${c.entidad}`,
    icon: Landmark,
    color: 'text-amber-500',
  },
}

export function NovedadesPanel({ cambios, onClose }: { cambios: Cambio[]; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center bg-slate-950/40 px-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Bell size={16} className="text-indigo-500" /> Novedades
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        {cambios.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
            Todavía no hay cambios registrados.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {cambios.map((c) => {
              const meta = TIPO_META[c.tipo]
              const Icon = meta.icon
              return (
                <li key={c.id} className="flex items-start gap-3 px-4 py-3">
                  <Icon size={15} className={`mt-0.5 shrink-0 ${meta.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{meta.label(c)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(c.createdAt)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
