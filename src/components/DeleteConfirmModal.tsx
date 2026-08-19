import { AlertTriangle, X } from 'lucide-react'
import type { Persona } from '../types'

interface Props {
  persona: Persona
  onCancel: () => void
  onVacate: () => void
  onDeleteForever: () => void
}

export function DeleteConfirmModal({ persona, onCancel, onVacate, onDeleteForever }: Props) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
      onMouseDown={onCancel}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/15">
              <AlertTriangle size={19} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Quitar contacto</h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">{persona.nombre}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            title="Cerrar"
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          ¿Qué quieres hacer con este cargo? Puedes dejarlo marcado como <strong>vacante</strong> para
          que el puesto no desaparezca (útil si vuelve a ocuparse pronto), o eliminarlo
          definitivamente del directorio.
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onVacate}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Dejar cargo vacante
          </button>
          <button
            type="button"
            onClick={onDeleteForever}
            className="w-full rounded-xl border border-rose-200 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            Eliminar definitivamente
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
