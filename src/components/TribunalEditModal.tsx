import { useState, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { FichaTribunal } from '../types'

export interface TribunalFormValues {
  ministroVisitador: string
  correo: string
  telefono: string
  competencias: string
}

interface Props {
  ficha: FichaTribunal
  onCancel: () => void
  onSubmit: (values: TribunalFormValues) => void
}

export function TribunalEditModal({ ficha, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<TribunalFormValues>({
    ministroVisitador: ficha.ministroVisitador ?? '',
    correo: ficha.correo ?? '',
    telefono: ficha.telefono ?? '',
    competencias: ficha.competencias.join(', '),
  })

  const set = <K extends keyof TribunalFormValues>(key: K, value: TribunalFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Editar ficha del tribunal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{ficha.nombre}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Ministro(a) visitador(a)">
            <input
              autoFocus
              value={values.ministroVisitador}
              onChange={(e) => set('ministroVisitador', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Correo general del tribunal">
            <input
              value={values.correo}
              onChange={(e) => set('correo', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Teléfono">
            <input
              value={values.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Competencias — separadas por coma">
            <input
              value={values.competencias}
              onChange={(e) => set('competencias', e.target.value)}
              placeholder="Civil, Laboral, Familia…"
              className={inputClass}
            />
          </Field>
        </div>

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
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/10'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  )
}
