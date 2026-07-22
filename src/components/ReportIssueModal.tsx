import { useState, type FormEvent } from 'react'
import { Flag, X } from 'lucide-react'

interface Props {
  subject: string
  contexto: string[]
  onSubmit: (descripcion: string) => Promise<void>
  onCancel: () => void
}

export function ReportIssueModal({ subject, contexto, onSubmit, onCancel }: Props) {
  const [descripcion, setDescripcion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!descripcion.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(descripcion.trim())
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el reporte.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Flag size={16} className="text-rose-500" />
              Reportar dato incorrecto
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subject}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            ¿Qué dato está incorrecto o desactualizado?
          </span>
          <textarea
            autoFocus
            required
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: el anexo cambió, el correo ya no funciona, la persona se cambió de unidad…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/10"
          />
        </label>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {contexto.filter(Boolean).join(' · ')}
        </p>
        {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {submitting ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </div>
      </form>
    </div>
  )
}
