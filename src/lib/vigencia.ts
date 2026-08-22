// Vigencia de cargos transitorios (reemplazo, suplencia, interinato): un
// cargo con "vigente hasta" en el pasado se considera vencido y debe
// alertarse en naranjo para que el administrador actualice la fecha o deje
// el cargo vacante.
export function esVigenciaVencida(vigenciaHasta: string | null | undefined): boolean {
  if (!vigenciaHasta) return false
  const hoy = new Date().toISOString().slice(0, 10)
  return vigenciaHasta < hoy
}

// "Primer día vencido": la fecha "hasta" fue exactamente ayer, es decir hoy
// es el primer día en que ya no está vigente. Se usa para la alerta única
// que ven los administradores (no se repite día tras día).
export function esPrimerDiaVencido(vigenciaHasta: string | null | undefined): boolean {
  if (!vigenciaHasta) return false
  const ayer = new Date()
  ayer.setDate(ayer.getDate() - 1)
  return vigenciaHasta === ayer.toISOString().slice(0, 10)
}

// Cargo cargado por adelantado (con "vigente desde" en el futuro): solo lo
// ven los administradores, marcado en gris con contorno verde, hasta que
// llegue esa fecha y pase a mostrarse para todos como cualquier otro.
export function esVigenciaFutura(vigenciaDesde: string | null | undefined): boolean {
  if (!vigenciaDesde) return false
  const hoy = new Date().toISOString().slice(0, 10)
  return vigenciaDesde > hoy
}

export function formatFecha(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}-${m}-${y}`
}
