import { useState } from 'react'
import { Check, Flag, RotateCcw, X } from 'lucide-react'
import type { Reporte, ReporteEstado } from '../types'
import { timeAgo } from '../lib/timeAgo'

interface Props {
  reportes: Reporte[]
  onSetEstado: (id: number, estado: ReporteEstado) => void
  onClose: () => void
}

export function ReportesPanel({ reportes, onSetEstado, onClose }: Props) {
  const [tab, setTab] = useState<ReporteEstado>('pendiente')
  const pendientes = reportes.filter((r) => r.estado === 'pendiente')
  const resueltos = reportes.filter((r) => r.estado === 'resuelto')
  const filtrados = tab === 'pendiente' ? pendientes : resueltos

  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center bg-slate-950/40 px-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Flag size={16} className="text-rose-500" /> Reportes
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex gap-1 px-4 pb-2">
            <button
              type="button"
              onClick={() => setTab('pendiente')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tab === 'pendiente'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Pendientes ({pendientes.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('resuelto')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tab === 'resuelto'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Resueltos ({resueltos.length})
            </button>
          </div>
        </div>
        {filtrados.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
            {tab === 'pendiente' ? 'No hay reportes pendientes.' : 'Todavía no hay reportes resueltos.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtrados.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.entidad}</p>
                {r.contexto && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">{r.contexto}</p>
                )}
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.descripcion}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(r.createdAt)}</p>
                  {r.estado === 'pendiente' ? (
                    <button
                      type="button"
                      onClick={() => onSetEstado(r.id, 'resuelto')}
                      className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                    >
                      <Check size={12} /> Marcar resuelto
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetEstado(r.id, 'pendiente')}
                      className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <RotateCcw size={12} /> Reabrir
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
