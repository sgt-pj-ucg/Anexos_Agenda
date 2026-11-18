import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, FileText, Inbox, Mail, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import type { CasillaInstitucional } from '../types'
import { normalize } from '../lib/normalize'
import { useCopy } from '../hooks/useCopy'

function CasillaCard({ casilla, onAbrir }: { casilla: CasillaInstitucional; onAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="group flex items-center gap-3.5 rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_14px_28px_-16px_rgba(14,165,233,.5)] dark:border-sky-900/40 dark:bg-sky-500/5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white transition-transform group-hover:scale-105">
        <Inbox size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900 dark:text-white">{casilla.nombre}</span>
        <span className="block truncate text-sm text-slate-500 dark:text-slate-400">{casilla.correo}</span>
      </span>
    </button>
  )
}

function CasillaDetalle({
  casilla,
  isAdmin,
  onCerrar,
  onEditar,
  onEliminar,
}: {
  casilla: CasillaInstitucional
  isAdmin: boolean
  onCerrar: () => void
  onEditar: () => void
  onEliminar: () => void
}) {
  const { copied, copy } = useCopy()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={onCerrar}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-in flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-[0_8px_16px_-6px_rgba(14,165,233,.55)]">
              <Inbox size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{casilla.nombre}</p>
              <p className="truncate text-sm text-slate-400 dark:text-slate-500">{casilla.correo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            title="Cerrar"
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${casilla.correo}`}
              title={`Redactar un correo a ${casilla.correo}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-900/50 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
            >
              <Mail size={14} />
              Enviar correo
            </a>
            <button
              type="button"
              onClick={() => copy(casilla.correo)}
              title="Copiar la dirección de correo"
              className="rounded-full border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-sky-600 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-sky-400"
            >
              {copied === casilla.correo ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>

            {casilla.pdfUrl ? (
              <a
                href={casilla.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-800 dark:hover:bg-sky-500/10"
              >
                <FileText size={14} />
                Ver PDF de acceso rápido
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-200 px-3.5 py-1.5 text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
                <FileText size={14} />
                Sin PDF adjunto
              </span>
            )}
          </div>

          {casilla.descripcion && (
            <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{casilla.descripcion}</p>
          )}
        </div>

        {isAdmin && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 p-5 dark:border-slate-700">
            <button
              type="button"
              onClick={onEditar}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Pencil size={15} />
              Editar
            </button>
            <button
              type="button"
              onClick={onEliminar}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <Trash2 size={15} />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function CasillasInstitucionalesModal({
  casillas,
  isAdmin,
  onClose,
  onCrear,
  onEditar,
  onEliminar,
}: {
  casillas: CasillaInstitucional[]
  isAdmin: boolean
  onClose: () => void
  onCrear: () => void
  onEditar: (casilla: CasillaInstitucional) => void
  onEliminar: (casilla: CasillaInstitucional) => void
}) {
  const [busqueda, setBusqueda] = useState('')
  const [casillaAbiertaId, setCasillaAbiertaId] = useState<string | null>(null)
  const [casillaAEliminar, setCasillaAEliminar] = useState<CasillaInstitucional | null>(null)
  const casillaAbierta = casillas.find((c) => c.id === casillaAbiertaId) ?? null

  const casillasFiltradas = useMemo(() => {
    const tokens = normalize(busqueda).split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return casillas
    return casillas.filter((c) => {
      const all = normalize([c.nombre, c.correo, c.descripcion].filter(Boolean).join(' '))
      return tokens.every((t) => all.includes(t))
    })
  }, [casillas, busqueda])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (casillaAEliminar) setCasillaAEliminar(null)
      else if (casillaAbiertaId) setCasillaAbiertaId(null)
      else onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, casillaAbiertaId, casillaAEliminar])

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-in relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-[0_8px_16px_-6px_rgba(14,165,233,.55)]">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Casillas Institucionales PJUD</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Correos institucionales, su finalidad y el instructivo de acceso rápido
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={onCrear}
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:border-sky-400 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/15"
              >
                <Plus size={13} />
                Crear casilla
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Cerrar"
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {casillas.length > 1 && (
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={15} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar casilla por nombre, correo o descripción…"
                className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-sky-500/10"
              />
            </div>
          </div>
        )}

        <div className="max-h-[620px] flex-1 overflow-y-auto p-5">
          {casillas.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
              Todavía no hay casillas institucionales cargadas.
            </p>
          ) : casillasFiltradas.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
              Ninguna casilla coincide con "{busqueda}".
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {casillasFiltradas.map((c) => (
                <CasillaCard key={c.id} casilla={c} onAbrir={() => setCasillaAbiertaId(c.id)} />
              ))}
            </div>
          )}
        </div>

        {casillaAbierta && !casillaAEliminar && (
          <CasillaDetalle
            casilla={casillaAbierta}
            isAdmin={isAdmin}
            onCerrar={() => setCasillaAbiertaId(null)}
            onEditar={() => onEditar(casillaAbierta)}
            onEliminar={() => setCasillaAEliminar(casillaAbierta)}
          />
        )}

        {casillaAEliminar && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onMouseDown={() => setCasillaAEliminar(null)}
          >
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="animate-fade-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="mb-1 font-semibold text-slate-900 dark:text-white">¿Eliminar esta casilla?</p>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                "{casillaAEliminar.nombre}" se eliminará por completo. Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCasillaAEliminar(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onEliminar(casillaAEliminar)
                    setCasillaAEliminar(null)
                    setCasillaAbiertaId(null)
                  }}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
