import { useState, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { Persona } from '../types'

export interface PersonFormValues {
  nombre: string
  cargo: string
  correos: string
  anexo: string
  cumpleanos: string
  calidadJuridica: string
  vigenciaDesde: string
  vigenciaHasta: string
  esGenerico: boolean
}

function toFormValues(p?: Persona): PersonFormValues {
  return {
    nombre: p && !p.vacante ? p.nombre : '',
    cargo: p?.cargo ?? '',
    correos: p?.correos.join(', ') ?? '',
    anexo: p?.anexo ?? '',
    cumpleanos: p?.cumpleanos ?? '',
    calidadJuridica: p?.calidadJuridica ?? '',
    vigenciaDesde: p?.vigenciaDesde ?? '',
    vigenciaHasta: p?.vigenciaHasta ?? '',
    esGenerico: p?.esGenerico ?? false,
  }
}

interface Props {
  title: string
  unidad: string
  initial?: Persona
  onCancel: () => void
  onSubmit: (values: PersonFormValues) => void
}

export function PersonEditModal({ title, unidad, initial, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<PersonFormValues>(() => toFormValues(initial))

  const set = <K extends keyof PersonFormValues>(key: K, value: PersonFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!values.nombre.trim()) return
    onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">{unidad}</p>
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
          <Field label="Nombre *">
            <input
              autoFocus
              required
              value={values.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              placeholder="Nombre completo"
              className={inputClass}
            />
          </Field>
          <Field label="Cargo">
            <input value={values.cargo} onChange={(e) => set('cargo', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Correo(s) institucional(es) — separados por coma">
            <input
              value={values.correos}
              onChange={(e) => set('correos', e.target.value)}
              placeholder="nombre@pjud.cl"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Anexo / teléfono">
              <input value={values.anexo} onChange={(e) => set('anexo', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Cumpleaños">
              <input
                value={values.cumpleanos}
                onChange={(e) => set('cumpleanos', e.target.value)}
                placeholder="15 de octubre"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Calidad jurídica">
            <input
              value={values.calidadJuridica}
              onChange={(e) => set('calidadJuridica', e.target.value)}
              placeholder="Titular, Contrata, Suplente…"
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
          <label className="flex items-start gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-600">
            <input
              type="checkbox"
              checked={values.esGenerico}
              onChange={(e) => set('esGenerico', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 dark:border-slate-500"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Es una casilla o anexo genérico, no una persona
              <span className="mt-0.5 block text-[11px] text-slate-400 dark:text-slate-500">
                Ej: "Casilla general", "Sala de Reuniones". Se excluye de los grupos de correo
                masivo por funcionario.
              </span>
            </span>
          </label>
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
