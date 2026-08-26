import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Route, Trash2, X } from 'lucide-react'
import type { FichaTribunal, Persona } from '../types'
import { destinoActualComo } from '../lib/destinoTribunal'
import { periodosSeSuperponen } from '../lib/cargoTransitorio'
import { hoyChile } from '../lib/fechaChile'
import { formatFecha } from '../lib/vigencia'
import { Field, inputClass } from './formPrimitives'

export interface CargoTransitorioPeriodoForm {
  key: string
  cargo: string
  calidadJuridica: string
  destino: string
  desde: string
  hasta: string
}

function nuevaKey(): string {
  return `nuevo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function periodoVacio(): CargoTransitorioPeriodoForm {
  return { key: nuevaKey(), cargo: '', calidadJuridica: '', destino: '', desde: '', hasta: '' }
}

function toFormPeriodos(p: Persona, tribunales: FichaTribunal[]): CargoTransitorioPeriodoForm[] {
  if (p.cargosTransitorios.length === 0) return [periodoVacio()]
  return p.cargosTransitorios.map((per) => ({
    key: per.id,
    cargo: per.cargo ?? '',
    calidadJuridica: per.calidadJuridica ?? '',
    destino: destinoActualComo(per.seccion, per.tribunal, per.unidad, tribunales),
    desde: per.desde ?? '',
    hasta: per.hasta ?? '',
  }))
}

function estadoPeriodo(desde: string, hasta: string): { label: string; className: string } | null {
  if (!desde || !hasta) return null
  const hoy = hoyChile()
  if (desde <= hoy && hasta >= hoy) {
    return { label: 'Vigente ahora', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' }
  }
  if (hoy < desde) {
    return { label: 'Próximo', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' }
  }
  return { label: 'Finalizado', className: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }
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
  onSubmit: (periodos: CargoTransitorioPeriodoForm[]) => void
}) {
  const [periodos, setPeriodos] = useState<CargoTransitorioPeriodoForm[]>(() => toFormPeriodos(persona, tribunales))

  const setPeriodo = <K extends keyof CargoTransitorioPeriodoForm>(key: string, campo: K, valor: CargoTransitorioPeriodoForm[K]) =>
    setPeriodos((prev) => prev.map((per) => (per.key === key ? { ...per, [campo]: valor } : per)))

  const agregarPeriodo = () => setPeriodos((prev) => [...prev, periodoVacio()])

  const eliminarPeriodo = (key: string) => {
    if (!window.confirm('¿Eliminar este período de cargo transitorio? Esta acción no se puede deshacer.')) return
    setPeriodos((prev) => prev.filter((per) => per.key !== key))
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const incompleto = periodos.find(
      (per) => !(per.destino && per.cargo.trim() && per.desde && per.hasta),
    )
    if (incompleto) {
      window.alert('Cada período necesita cargo, tribunal destino, desde y hasta completos.')
      return
    }

    for (let i = 0; i < periodos.length; i++) {
      for (let j = i + 1; j < periodos.length; j++) {
        const a = periodos[i]
        const b = periodos[j]
        if (periodosSeSuperponen({ desde: a.desde, hasta: a.hasta }, { desde: b.desde, hasta: b.hasta })) {
          window.alert(
            `El período ${i + 1} (${formatFecha(a.desde)} al ${formatFecha(a.hasta)}) se superpone con el período ${j + 1} (${formatFecha(b.desde)} al ${formatFecha(b.hasta)}). Ajusta las fechas antes de guardar.`,
          )
          return
        }
      }
    }

    onSubmit(periodos)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm"
      onMouseDown={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-xl dark:border-sky-900/50 dark:bg-slate-800"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
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

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Un período por cada vez que este funcionario va en comisión de servicio a otro
            tribunal o unidad. Mientras la fecha de hoy caiga dentro de un período, se verá en ese
            destino; fuera de todos, vuelve solo a su tribunal de origen ({persona.unidad}).
          </p>

          {periodos.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400 dark:border-slate-600 dark:text-slate-500">
              Sin períodos cargados todavía.
            </p>
          )}

          {periodos.map((per, i) => {
            const estado = estadoPeriodo(per.desde, per.hasta)
            return (
              <div
                key={per.key}
                className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Período {i + 1}</p>
                    {estado && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${estado.className}`}>
                        {estado.label}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarPeriodo(per.key)}
                    title="Eliminar este período"
                    className="rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <Field label="Cargo al que va">
                  <input
                    value={per.cargo}
                    onChange={(e) => setPeriodo(per.key, 'cargo', e.target.value)}
                    placeholder="Cargo en el tribunal de destino"
                    className={inputClass}
                  />
                </Field>
                <Field label="Calidad jurídica en el destino">
                  <input
                    value={per.calidadJuridica}
                    onChange={(e) => setPeriodo(per.key, 'calidadJuridica', e.target.value)}
                    placeholder="Titular, Suplente, Interino…"
                    className={inputClass}
                  />
                </Field>
                <Field label="Nuevo tribunal o unidad">
                  <select
                    value={per.destino}
                    onChange={(e) => setPeriodo(per.key, 'destino', e.target.value)}
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
                      value={per.desde}
                      onChange={(e) => setPeriodo(per.key, 'desde', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Hasta">
                    <input
                      type="date"
                      value={per.hasta}
                      onChange={(e) => setPeriodo(per.key, 'hasta', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={agregarPeriodo}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-sky-300 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-500/10"
          >
            <Plus size={15} />
            Agregar otro período
          </button>
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
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
