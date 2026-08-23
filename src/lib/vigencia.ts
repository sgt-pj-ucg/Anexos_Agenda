import { addDiasIso, hoyChile } from './fechaChile'

// Vigencia de cargos transitorios (reemplazo, suplencia, interinato): un
// cargo con "vigente hasta" en el pasado se considera vencido y debe
// alertarse en naranjo para que el administrador actualice la fecha o deje
// el cargo vacante.
export function esVigenciaVencida(vigenciaHasta: string | null | undefined): boolean {
  if (!vigenciaHasta) return false
  return vigenciaHasta < hoyChile()
}

// "Primer día vencido": la fecha "hasta" fue exactamente ayer, es decir hoy
// es el primer día en que ya no está vigente. Se usa para la alerta única
// que ven los administradores (no se repite día tras día).
export function esPrimerDiaVencido(vigenciaHasta: string | null | undefined): boolean {
  if (!vigenciaHasta) return false
  return vigenciaHasta === addDiasIso(hoyChile(), -1)
}

// Cargo cargado por adelantado (con "vigente desde" en el futuro): solo lo
// ven los administradores, marcado en gris con contorno verde, hasta que
// llegue esa fecha y pase a mostrarse para todos como cualquier otro.
export function esVigenciaFutura(vigenciaDesde: string | null | undefined): boolean {
  if (!vigenciaDesde) return false
  return vigenciaDesde > hoyChile()
}

export function formatFecha(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}-${m}-${y}`
}
