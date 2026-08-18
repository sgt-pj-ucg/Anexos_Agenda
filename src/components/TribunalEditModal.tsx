import { useState, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { FichaTribunal, Persona } from '../types'
import { PersonaEmailPicker } from './PersonaEmailPicker'

export interface TribunalFormValues {
  ministroVisitador: string
  telefonos: string
  direccion: string
  competencias: string
  correoAdminSecretario: string
  correoSegundoLider: string
}

interface Props {
  ficha: FichaTribunal
  personas: Persona[]
  onCancel: () => void
  onSubmit: (values: TribunalFormValues) => void
}

export function TribunalEditModal({ ficha, personas, onCancel, onSubmit }: Props) {
  const funcionarios = personas.filter((p) => p.tribunal === ficha.nombre)
  const administrador = funcionarios.find(
    (p) => p.correos.length > 0 && /administrador/i.test(p.cargo ?? ''),
  )
  const jueces = funcionarios.filter((p) => p.correos.length > 0 && /^juez$/i.test(p.cargo ?? ''))
  const juezUnico = jueces.length === 1 ? jueces[0] : undefined

  const [values, setValues] = useState<TribunalFormValues>({
    ministroVisitador: ficha.ministroVisitador ?? '',
    telefonos: ficha.telefonos.join(', '),
    direccion: ficha.direccion ?? '',
    competencias: ficha.competencias.join(', '),
    correoAdminSecretario: ficha.correoAdminSecretario ?? administrador?.correos[0] ?? '',
    correoSegundoLider: ficha.correoSegundoLider ?? juezUnico?.correos[0] ?? '',
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
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Editar ficha del tribunal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">{ficha.nombre}</p>
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
          <Field label="Ministro(a) visitador(a)">
            <input
              autoFocus
              value={values.ministroVisitador}
              onChange={(e) => set('ministroVisitador', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Correo general del tribunal (fijo, no editable)">
            <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-300">
              {ficha.correo ?? 'Sin correo general'}
            </p>
          </Field>
          <Field label="Dirección">
            <input
              value={values.direccion}
              onChange={(e) => set('direccion', e.target.value)}
              placeholder="Calle, número, comuna…"
              className={inputClass}
            />
          </Field>
          <Field label="Teléfono(s) — separados por coma">
            <input
              value={values.telefonos}
              onChange={(e) => set('telefonos', e.target.value)}
              placeholder="Mesón: 51 2xxxxxx, OIRS: 51 2xxxxxx…"
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
          <Field label="Correo administrador(a) o secretario(a)">
            <PersonaEmailPicker
              personas={funcionarios}
              value={values.correoAdminSecretario}
              onChange={(v) => set('correoAdminSecretario', v)}
              placeholder="Busca por nombre o cargo…"
              prioridad={(p) => /administrador|secretario/i.test(p.cargo ?? '')}
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
              {administrador
                ? `Sugerido por defecto: ${administrador.nombre} (Administrador). Puedes buscar y elegir a otro funcionario, por ejemplo el/la secretario(a).`
                : 'No hay un funcionario con cargo "Administrador" registrado. Busca al secretario(a) u otro responsable.'}
            </p>
          </Field>
          <Field label="Correo del Juez Presidente / Juez">
            <PersonaEmailPicker
              personas={funcionarios}
              value={values.correoSegundoLider}
              onChange={(v) => set('correoSegundoLider', v)}
              placeholder="Busca por nombre o cargo…"
              prioridad={(p) => /juez/i.test(p.cargo ?? '')}
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
              {juezUnico
                ? `Sugerido por defecto: ${juezUnico.nombre} (Juez).`
                : jueces.length > 1
                  ? 'Este tribunal tiene varios jueces. Busca y selecciona quién ejerce como Juez Presidente.'
                  : 'No hay jueces registrados para este tribunal. Busca entre el resto del personal.'}
            </p>
          </Field>
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
