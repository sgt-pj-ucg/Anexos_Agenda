import { useState, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { ContactoExterno } from '../types'

export interface ContactoExternoFormValues {
  institucion: string
  nombre: string
  cargo: string
  comuna: string
  correos: string
  telefonos: string
  direccion: string
  calidadJuridica: string
  observaciones: string
  vigenciaDesde: string
  vigenciaHasta: string
}

function toFormValues(c?: ContactoExterno): ContactoExternoFormValues {
  return {
    institucion: c?.institucion ?? '',
    nombre: c?.nombre ?? '',
    cargo: c?.cargo ?? '',
    comuna: c?.comuna ?? '',
    correos: c?.correos.join(', ') ?? '',
    telefonos: c?.telefonos.join(', ') ?? '',
    direccion: c?.direccion ?? '',
    calidadJuridica: c?.calidadJuridica ?? '',
    observaciones: c?.observaciones ?? '',
    vigenciaDesde: c?.vigenciaDesde ?? '',
    vigenciaHasta: c?.vigenciaHasta ?? '',
  }
}

interface Props {
  title: string
  categoriaLabel: string
  initial?: ContactoExterno
  onCancel: () => void
  onSubmit: (values: ContactoExternoFormValues) => void
}

export function ContactoExternoEditModal({ title, categoriaLabel, initial, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<ContactoExternoFormValues>(() => toFormValues(initial))

  const set = <K extends keyof ContactoExternoFormValues>(key: K, value: ContactoExternoFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              {initial ? (initial.nombre ?? initial.institucion) : categoriaLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Institución">
            <input
              autoFocus
              value={values.institucion}
              onChange={(e) => set('institucion', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Nombre">
            <input
              value={values.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Cargo">
            <input
              value={values.cargo}
              onChange={(e) => set('cargo', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Comuna / jurisdicción">
            <input
              value={values.comuna}
              onChange={(e) => set('comuna', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Correo(s) — separados por coma">
            <input
              value={values.correos}
              onChange={(e) => set('correos', e.target.value)}
              placeholder="correo@ejemplo.cl, otro@ejemplo.cl"
              className={inputClass}
            />
          </Field>
          <Field label="Teléfono(s) — separados por coma">
            <input
              value={values.telefonos}
              onChange={(e) => set('telefonos', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Dirección">
            <input
              value={values.direccion}
              onChange={(e) => set('direccion', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Calidad jurídica (ej. Titular, Interino)">
            <input
              value={values.calidadJuridica}
              onChange={(e) => set('calidadJuridica', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Observaciones">
            <textarea
              value={values.observaciones}
              onChange={(e) => set('observaciones', e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vigente desde">
              <input
                type="date"
                value={values.vigenciaDesde}
                onChange={(e) => set('vigenciaDesde', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Vigente hasta">
              <input
                type="date"
                value={values.vigenciaHasta}
                onChange={(e) => set('vigenciaHasta', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Completa esto solo si es un cargo transitorio (reemplazo, suplencia, interinato): al
            pasar la fecha "hasta", la tarjeta se marcará en naranjo como aviso.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
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
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/10'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-300">{label}</span>
      {children}
    </label>
  )
}
