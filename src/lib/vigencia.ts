// Vigencia de cargos transitorios (reemplazo, suplencia, interinato): un
// cargo con "vigente hasta" en el pasado se considera vencido y debe
// alertarse en naranjo para que el administrador actualice la fecha o deje
// el cargo vacante.
export function esVigenciaVencida(vigenciaHasta: string | null | undefined): boolean {
  if (!vigenciaHasta) return false
  const hoy = new Date().toISOString().slice(0, 10)
  return vigenciaHasta < hoy
}

export function formatFecha(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}-${m}-${y}`
}
