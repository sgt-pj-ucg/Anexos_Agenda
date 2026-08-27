import type { Persona } from '../types'
import { hoyChile } from './fechaChile'

export const AUSENTE_TIPOS = [
  { value: 'licencia_medica', label: 'Licencia Médica' },
  { value: 'feriado_legal', label: 'Feriado Legal' },
  { value: 'psgds', label: 'Permiso sin Goce de Sueldo (PSGDS)' },
  { value: 'permiso', label: 'Permiso' },
  { value: 'otro', label: 'Otro' },
] as const

export function ausenteTipoLabel(tipo: string | null, motivo: string | null): string {
  if (tipo === 'otro') return motivo?.trim() || 'Otro'
  return AUSENTE_TIPOS.find((t) => t.value === tipo)?.label ?? motivo?.trim() ?? 'Ausente'
}

export function ausentismoActivo(p: Persona): boolean {
  const hoy = hoyChile()
  return !!(p.ausenteDesde && p.ausenteHasta && p.ausenteDesde <= hoy && p.ausenteHasta >= hoy)
}

// Ya quedó cargada, pero su fecha "desde" todavía no llega: solo para que
// el admin pueda confirmar de un vistazo que ya la cargó.
export function ausentismoFuturo(p: Persona): boolean {
  const hoy = hoyChile()
  return !!(p.ausenteDesde && p.ausenteDesde > hoy)
}

// A diferencia del cargo transitorio, el ausentismo no traslada a la
// persona de tribunal: solo la marca como ausente mientras está vigente. Al
// pasar "ausenteHasta" deja de aplicar sola, sin que nadie tenga que
// limpiar el dato a mano.
export function aplicarAusentismo(p: Persona): Persona {
  if (!ausentismoActivo(p)) return p
  return { ...p, ausente: true }
}
