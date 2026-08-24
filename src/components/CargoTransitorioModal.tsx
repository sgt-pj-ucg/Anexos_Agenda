import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Route, X } from 'lucide-react'
import type { FichaTribunal, Persona } from '../types'
import { destinoActualComo } from '../lib/destinoTribunal'
import { Field, inputClass } from './formPrimitives'

export interface CargoTransitorioFormValues {
  cargo: string
  calidadJuridica: string
  destino: string
  desde: string
  hasta: string
}

function toFormValues(p: Persona, tribunales: FichaTribunal[]): CargoTransitorioFormValues {
  return {
    cargo: p.cargoTransitorio ?? '',
    calidadJuridica: p.calidadJuridicaTransitoria ?? '',
    destino: destinoActualComo(p.seccionTransitorio, p.tribunalTransitorio, p.unidadTransitorio, tribunales),
    desde: p.transitorioDesde ?? '',
    hasta: p.transitorioHasta ?? '',
  }
}

export function CargoTransitorioModal({
  persona,
  tribunales,
  corteUnidades,
  onCancel,
  onSubmit,
}: {
  persona: Persona
  tribunales: FichaTribunal[]
  corteUnidades: string[]
  onCancel: () => void
  onSubmit: (values: CargoTransitorioFormValues) => void
}) {
  const [values, setValues] = useState<CargoTransitorioFormValues>(() => toFormValues(persona, tribunales))

  const set = <K extends keyof CargoTransitorioFormValues>(key: K, value: CargoTransitorioFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const quitar = () => setValues({ cargo: '', calidadJuridica: '', destino: '', desde: '', hasta: '' })

  const completo = values.destino && values.cargo.trim() && values.desde && values.hasta
  const parcial = !completo && (values.destino || values.cargo.trim() || values.desde || values.hasta)
  const tieneDatos = values.cargo || values.calidadJuridica || values.destino || values.desde || values.hasta

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
      window.alert('Completa destino, cargo, desde y hasta — o usa "Quitar cargo transitorio" para dejarlo vacío.')
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
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-sky-200 bg-white p-5 shadow-xl dark:border-sky-900/50 dark:bg-slate-800"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
              <Route size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Cargo Transitorio</h2>
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
            Úsalo cuando este funcionario vaya en comisión de servicio a otro tribunal o unidad,
            por un período con fecha de término conocida. Mientras esté vigente aparecerá en el
            destino con estos datos; al pasar la fecha "hasta" vuelve solo a su tribunal de
            origen ({persona.unidad}), sin que nadie tenga que hacer nada.
          </p>
          <Field label="Cargo al que va">
            <input
              value={values.cargo}
              onChange={(e) => set('cargo', e.target.value)}
              placeholder="Cargo en el tribunal de destino"
              className={inputClass}
            />
          </Field>
          <Field label="Calidad jurídica en el destino">
            <input
              value={values.calidadJuridica}
              onChange={(e) => set('calidadJuridica', e.target.value)}
              placeholder="Titular, Suplente, Interino…"
              className={inputClass}
            />
          </Field>
          <Field label="Nuevo tribunal o unidad">
            <select value={values.destino} onChange={(e) => set('destino', e.target.value)} className={inputClass}>
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
              Quitar cargo transitorio
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
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
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
