import { useState, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { FichaTribunal, Persona } from '../types'

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
  destino: string
  transitorioCargo: string
  transitorioDestino: string
  transitorioDesde: string
  transitorioHasta: string
}

// Reconstruye la opción del selector ("tribunal:<id>" o "corte:<unidad>") a
// partir del cargo transitorio ya guardado, para que al editar se vea la
// comisión actual en vez de partir en blanco.
function destinoTransitorioActual(p: Persona | undefined, tribunales: FichaTribunal[]): string {
  if (!p?.tribunalTransitorio && !p?.unidadTransitorio) return ''
  if (p.seccionTransitorio === 'tribunal') {
    const ficha = tribunales.find((t) => t.nombre === p.tribunalTransitorio)
    return ficha ? `tribunal:${ficha.id}` : ''
  }
  return p.unidadTransitorio ? `corte:${p.unidadTransitorio}` : ''
}

function toFormValues(p: Persona | undefined, tribunales: FichaTribunal[]): PersonFormValues {
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
    destino: '',
    transitorioCargo: p?.cargoTransitorio ?? '',
    transitorioDestino: destinoTransitorioActual(p, tribunales),
    transitorioDesde: p?.transitorioDesde ?? '',
    transitorioHasta: p?.transitorioHasta ?? '',
  }
}

interface Props {
  title: string
  unidad: string
  initial?: Persona
  tribunales?: FichaTribunal[]
  corteUnidades?: string[]
  onCancel: () => void
  onSubmit: (values: PersonFormValues) => void
}

export function PersonEditModal({
  title,
  unidad,
  initial,
  tribunales = [],
  corteUnidades = [],
  onCancel,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<PersonFormValues>(() => toFormValues(initial, tribunales))

  const set = <K extends keyof PersonFormValues>(key: K, value: PersonFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const quitarTransitorio = () =>
    setValues((v) => ({ ...v, transitorioCargo: '', transitorioDestino: '', transitorioDesde: '', transitorioHasta: '' }))

  const transitorioCompleto =
    values.transitorioDestino && values.transitorioCargo.trim() && values.transitorioDesde && values.transitorioHasta
  const transitorioParcial =
    !transitorioCompleto &&
    (values.transitorioDestino || values.transitorioCargo.trim() || values.transitorioDesde || values.transitorioHasta)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!values.nombre.trim()) return
    if (transitorioParcial) {
      window.alert(
        'Para el cargo transitorio completa destino, cargo, desde y hasta — o usa "Quitar cargo transitorio" para dejarlo vacío.',
      )
      return
    }
    onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800"
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
            Completa esto solo si este cargo se ocupa por tiempo limitado en esta misma unidad
            (reemplazo, suplencia, interinato): al pasar la fecha "hasta", la tarjeta se marcará
            en naranjo como aviso.
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

          {initial && (tribunales.length > 0 || corteUnidades.length > 0) && (
            <Field label="Trasladar a otro tribunal o unidad de la Corte">
              <select
                value={values.destino}
                onChange={(e) => set('destino', e.target.value)}
                className={inputClass}
              >
                <option value="">(mantener aquí: {unidad})</option>
                {corteUnidades.length > 0 && (
                  <optgroup label="Corte de Apelaciones">
                    {corteUnidades.map((u) => (
                      <option key={u} value={`corte:${u}`}>
                        {u}
                      </option>
                    ))}
                  </optgroup>
                )}
                {tribunales.length > 0 && (
                  <optgroup label="Tribunales">
                    {tribunales.map((t) => (
                      <option key={t.id} value={`tribunal:${t.id}`}>
                        {t.nombre}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
                Úsalo cuando este funcionario cambie de tribunal, o vaya de/hacia la Corte de
                Apelaciones: actualiza unidad, tribunal y comuna en un solo paso.
              </span>
            </Field>
          )}

          {initial && (tribunales.length > 0 || corteUnidades.length > 0) && (
            <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/60 p-3 dark:border-sky-900/50 dark:bg-sky-500/5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-sky-800 dark:text-sky-300">Cargo Transitorio</p>
                {(values.transitorioCargo ||
                  values.transitorioDestino ||
                  values.transitorioDesde ||
                  values.transitorioHasta) && (
                  <button
                    type="button"
                    onClick={quitarTransitorio}
                    className="text-[11px] font-medium text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
                  >
                    Quitar cargo transitorio
                  </button>
                )}
              </div>
              <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80">
                Nombre: {values.nombre || '—'} · Correo: {values.correos || '(sin correo)'} (se mantienen)
              </p>
              <Field label="Cargo al que va">
                <input
                  value={values.transitorioCargo}
                  onChange={(e) => set('transitorioCargo', e.target.value)}
                  placeholder="Cargo en el tribunal de destino"
                  className={inputClass}
                />
              </Field>
              <Field label="Nuevo tribunal o unidad">
                <select
                  value={values.transitorioDestino}
                  onChange={(e) => set('transitorioDestino', e.target.value)}
                  className={inputClass}
                >
                  <option value="">(elegir destino)</option>
                  {corteUnidades.length > 0 && (
                    <optgroup label="Corte de Apelaciones">
                      {corteUnidades.map((u) => (
                        <option key={u} value={`corte:${u}`}>
                          {u}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {tribunales.length > 0 && (
                    <optgroup label="Tribunales">
                      {tribunales.map((t) => (
                        <option key={t.id} value={`tribunal:${t.id}`}>
                          {t.nombre}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Desde">
                  <input
                    type="date"
                    value={values.transitorioDesde}
                    onChange={(e) => set('transitorioDesde', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Hasta">
                  <input
                    type="date"
                    value={values.transitorioHasta}
                    onChange={(e) => set('transitorioHasta', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80">
                Úsalo cuando el funcionario vaya en comisión de servicio a otro tribunal o unidad,
                por un período con fecha de término conocida. Al guardar, aparecerá en el destino
                desde la fecha "desde" (o de inmediato si ya llegó); al pasar la fecha "hasta"
                vuelve solo a su tribunal de origen, sin que nadie tenga que hacer nada. El cargo
                oficial de arriba no se modifica.
              </p>
            </div>
          )}
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
