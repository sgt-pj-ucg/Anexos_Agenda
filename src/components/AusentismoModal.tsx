import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { CalendarX, X } from 'lucide-react'
import type { Persona } from '../types'
import { AUSENTE_TIPOS } from '../lib/ausentismo'
import { Field, inputClass } from './formPrimitives'

export interface AusentismoFormValues {
  tipo: string
  motivo: string
  desde: string
  hasta: string
}

function toFormValues(p: Persona): AusentismoFormValues {
  return {
    tipo: p.ausenteTipo ?? '',
    motivo: p.ausenteMotivo ?? '',
    desde: p.ausenteDesde ?? '',
    hasta: p.ausenteHasta ?? '',
  }
}

export function AusentismoModal({
  persona,
  onCancel,
  onSubmit,
}: {
  persona: Persona
  onCancel: () => void
  onSubmit: (values: AusentismoFormValues) => void
}) {
  const [values, setValues] = useState<AusentismoFormValues>(() => toFormValues(persona))

  const set = <K extends keyof AusentismoFormValues>(key: K, value: AusentismoFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const quitar = () => setValues({ tipo: '', motivo: '', desde: '', hasta: '' })

  const completo = values.tipo && (values.tipo !== 'otro' || values.motivo.trim()) && values.desde && values.hasta
  const parcial = !completo && (values.tipo || values.motivo.trim() || values.desde || values.hasta)
  const tieneDatos = values.tipo || values.motivo || values.desde || values.hasta

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (parcial) {
      const falta = values.tipo === 'otro' && !values.motivo.trim() ? ' (falta el motivo de "Otro")' : ''
      window.alert(`Completa tipo, desde y hasta${falta} — o usa "Quitar ausentismo" para dejarlo vacío.`)
      return
    }
    onSubmit(values)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm"
      onMouseDown={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-violet-200 bg-white p-5 shadow-xl dark:border-violet-900/50 dark:bg-slate-800"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
              <CalendarX size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Ausentismo</h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">{persona.nombre}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Marca a este funcionario como ausente por un período con fecha de término conocida,
            sin moverlo de tribunal. Mientras esté vigente se verá marcado en su tarjeta; al pasar
            la fecha "hasta" vuelve solo a la normalidad.
          </p>
          <Field label="Tipo de ausentismo">
            <select value={values.tipo} onChange={(e) => set('tipo', e.target.value)} className={inputClass}>
              <option value="">(elegir tipo)</option>
              {AUSENTE_TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          {values.tipo === 'otro' && (
            <Field label="Motivo">
              <input
                value={values.motivo}
                onChange={(e) => set('motivo', e.target.value)}
                placeholder="Describe el motivo del ausentismo"
                className={inputClass}
              />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Desde">
              <input
                type="date"
                value={values.desde}
                onChange={(e) => set('desde', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Hasta">
              <input
                type="date"
                value={values.hasta}
                onChange={(e) => set('hasta', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          {tieneDatos ? (
            <button
              type="button"
              onClick={quitar}
              className="text-xs font-medium text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
            >
              Quitar ausentismo
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Guardar
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  )
}
