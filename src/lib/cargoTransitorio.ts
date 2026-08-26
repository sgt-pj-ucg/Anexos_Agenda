import type { CargoTransitorioPeriodo, Persona } from '../types'
import { hoyChile } from './fechaChile'

export function periodoActivo(periodos: CargoTransitorioPeriodo[]): CargoTransitorioPeriodo | null {
  const hoy = hoyChile()
  return periodos.find((per) => per.desde && per.hasta && per.desde <= hoy && per.hasta >= hoy) ?? null
}

export function periodosSeSuperponen(
  a: { desde: string; hasta: string },
  b: { desde: string; hasta: string },
): boolean {
  return a.desde <= b.hasta && b.desde <= a.hasta
}

// Mientras haya un período de cargo transitorio vigente HOY, la persona se
// muestra en su tribunal/unidad de destino en toda la plataforma (buscador,
// grupos, organigrama, correo masivo), guardando el dato de origen para
// mostrarlo en la tarjeta. Fuera de todo período (antes de que empiece,
// entre uno y otro, o después de que terminen todos) esta función no
// aplica ninguna superposición sola, sin que nadie tenga que devolver el
// registro a mano: el dato oficial (arriba en el formulario) nunca se toca.
export function aplicarCargoTransitorio(p: Persona): Persona {
  const activo = periodoActivo(p.cargosTransitorios)
  if (!activo) return p
  return {
    ...p,
    cargo: activo.cargo ?? p.cargo,
    calidadJuridica: activo.calidadJuridica ?? p.calidadJuridica,
    unidad: activo.unidad ?? p.unidad,
    seccion: activo.seccion ?? p.seccion,
    tribunal: activo.tribunal ?? p.tribunal,
    comuna: activo.comuna ?? p.comuna,
    enComision: true,
    origenCargo: p.cargo,
    origenUnidad: p.unidad,
    origenTribunal: p.tribunal,
    origenCalidadJuridica: p.calidadJuridica,
    periodoActivo: activo,
  }
}
