import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { CategoriaExterna } from '../types'
import { CATEGORIA_META, CATEGORIA_ORDER } from '../lib/contactosExternos'

export function ContactoExternoPickerModal({
  counts,
  onSelect,
  onClose,
}: {
  counts: Record<string, number>
  onSelect: (categoria: CategoriaExterna) => void
  onClose: () => void
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-in w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contactos externos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Elige qué directorio quieres consultar
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CATEGORIA_ORDER.map((key) => {
            const meta = CATEGORIA_META[key]
            const Icon = meta.icon
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-500/10"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-500/15 dark:text-emerald-400">
                  <Icon size={26} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{meta.label}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{meta.description}</p>
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    {counts[key] ?? 0} contactos
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}
