import { useState } from 'react'
import { AlertTriangle, Check, Flag, RotateCcw, X } from 'lucide-react'
import type { Reporte, ReporteEstado } from '../types'
import type { VigenciaVencidaItem } from '../lib/vigenciaVencidos'
import { formatFecha } from '../lib/vigencia'
import { timeAgo } from '../lib/timeAgo'

interface Props {
  reportes: Reporte[]
  vigenciasVencidas: VigenciaVencidaItem[]
  onSetEstado: (id: number, estado: ReporteEstado) => void
  onClose: () => void
}

export function ReportesPanel({ reportes, vigenciasVencidas, onSetEstado, onClose }: Props) {
  const [tab, setTab] = useState<ReporteEstado>('pendiente')
  const pendientes = reportes.filter((r) => r.estado === 'pendiente')
  const resueltos = reportes.filter((r) => r.estado === 'resuelto')
  const filtrados = tab === 'pendiente' ? pendientes : resueltos
  const totalPendientes = pendientes.length + vigenciasVencidas.length

  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center bg-slate-950/40 px-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Flag size={16} className="text-rose-500" /> Reportes
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
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
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Pendientes ({totalPendientes})
            </button>
            <button
              type="button"
              onClick={() => setTab('resuelto')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tab === 'resuelto'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Resueltos ({resueltos.length})
            </button>
          </div>
        </div>
        {filtrados.length === 0 && (tab === 'resuelto' || vigenciasVencidas.length === 0) ? (
          <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-400">
            {tab === 'pendiente' ? 'No hay reportes pendientes.' : 'Todavía no hay reportes resueltos.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {tab === 'pendiente' &&
              vigenciasVencidas.map((v) => (
                <li key={v.id} className="flex items-start gap-2 bg-orange-50/50 px-4 py-3 dark:bg-orange-500/5">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-orange-500" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-100">
                      {v.nombre}
                      <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                        Vigencia vencida
                      </span>
                    </p>
                    {v.contexto && (
                      <p className="text-xs text-slate-400 dark:text-slate-400">{v.contexto}</p>
                    )}
                    <p className="mt-1 text-xs text-orange-700/80 dark:text-orange-300/70">
                      Venció el {formatFecha(v.hasta)} · se resuelve al actualizar la vigencia
                    </p>
                  </div>
                </li>
              ))}
            {filtrados.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.entidad}</p>
                {r.contexto && (
                  <p className="text-xs text-slate-400 dark:text-slate-400">{r.contexto}</p>
                )}
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">{r.descripcion}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-400 dark:text-slate-400">{timeAgo(r.createdAt)}</p>
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
                      className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
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
