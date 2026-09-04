import type { ContactoExterno, Persona } from '../types'
import { esVigenciaVencida } from './vigencia'

export interface VigenciaVencidaItem {
  id: string
  nombre: string
  contexto: string
  hasta: string
}

// Cargos con vigencia por un período determinado (no cargos transitorios)
// cuya fecha "hasta" ya pasó: se listan junto a los reportes de datos
// incorrectos para que sean igual de fáciles de encontrar, pero marcados
// aparte. A diferencia de un reporte, no hay que "resolverlos" a mano: al
// actualizar la vigencia de la persona o el contacto, desaparecen solos.
export function listarVigenciasVencidas(
  people: Persona[],
  contactosExternos: ContactoExterno[],
): VigenciaVencidaItem[] {
  const personas = people
    .filter((p) => esVigenciaVencida(p.vigenciaHasta))
    .map((p) => ({ id: `p-${p.id}`, nombre: p.nombre, contexto: p.unidad, hasta: p.vigenciaHasta! }))
  const externos = contactosExternos
    .filter((c) => esVigenciaVencida(c.vigenciaHasta))
    .map((c) => ({
      id: `c-${c.id}`,
      nombre: c.nombre ?? c.institucion ?? 'Contacto externo',
      contexto: c.institucion ?? '',
      hasta: c.vigenciaHasta!,
    }))
  return [...personas, ...externos]
}
