import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Inbox, X } from 'lucide-react'
import type { CasillaInstitucional } from '../types'

export function CasillaInstitucionalEditorModal({
  casilla,
  onCancel,
  onSubmit,
}: {
  casilla?: CasillaInstitucional
  onCancel: () => void
  onSubmit: (values: {
    id?: string
    nombre: string
    correo: string
    descripcion: string | null
    pdfUrl: string | null
  }) => void
}) {
  const [nombre, setNombre] = useState(casilla?.nombre ?? '')
  const [correo, setCorreo] = useState(casilla?.correo ?? '')
  const [descripcion, setDescripcion] = useState(casilla?.descripcion ?? '')
  const [pdfUrl, setPdfUrl] = useState(casilla?.pdfUrl ?? '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !correo.trim()) return
    onSubmit({
      id: casilla?.id,
      nombre: nombre.trim(),
      correo: correo.trim(),
      descripcion: descripcion.trim() || null,
      pdfUrl: pdfUrl.trim() || null,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onMouseDown={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-in flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white">
              <Inbox size={18} />
            </div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {casilla ? 'Editar casilla' : 'Crear casilla'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-300">
              Nombre de la casilla
            </span>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Notificaciones Previsionales"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-sky-500/10"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-300">
              Correo institucional
            </span>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="casilla@pjud.cl"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-sky-500/10"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-300">
              Descripción (para qué sirve esta casilla)
            </span>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              placeholder="Ej. Comunicación y responsabilidades sobre modificaciones de los antecedentes previsionales, de salud y APV."
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-sky-500/10"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-300">
              Enlace al PDF de acceso rápido (opcional)
            </span>
            <input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-sky-500/10"
            />
            <span className="mt-1.5 block text-xs text-slate-400 dark:text-slate-500">
              Sube el PDF a un lugar público (Supabase Storage, Drive, etc.) y pega aquí el enlace directo.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!nombre.trim() || !correo.trim()}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
