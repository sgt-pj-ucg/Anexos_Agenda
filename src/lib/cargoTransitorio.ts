import type { Persona } from '../types'
import { hoyChile } from './fechaChile'

export function transitorioActivo(p: Persona): boolean {
  const hoy = hoyChile()
  return !!(p.transitorioDesde && p.transitorioHasta && p.transitorioDesde <= hoy && p.transitorioHasta >= hoy)
}

// Mientras el cargo transitorio está vigente, la persona se muestra en su
// tribunal/unidad de destino en toda la plataforma (buscador, grupos,
// organigrama, correo masivo), guardando el dato de origen para poder
// mostrarlo en la tarjeta. Al pasar "transitorioHasta" esta función deja de
// aplicar la superposición sola, sin que nadie tenga que devolver el
// registro a mano: el dato oficial (arriba) nunca se toca.
export function aplicarCargoTransitorio(p: Persona): Persona {
  if (!transitorioActivo(p)) return p
  return {
    ...p,
    cargo: p.cargoTransitorio ?? p.cargo,
    calidadJuridica: p.calidadJuridicaTransitoria ?? p.calidadJuridica,
    unidad: p.unidadTransitorio ?? p.unidad,
    seccion: p.seccionTransitorio ?? p.seccion,
    tribunal: p.tribunalTransitorio ?? p.tribunal,
    comuna: p.comunaTransitorio ?? p.comuna,
    enComision: true,
    origenCargo: p.cargo,
    origenUnidad: p.unidad,
    origenTribunal: p.tribunal,
    origenCalidadJuridica: p.calidadJuridica,
  }
}
