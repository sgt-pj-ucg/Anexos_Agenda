import type { FichaTribunal, Seccion } from '../types'

export interface DestinoResuelto {
  seccion: Seccion
  tribunal: string
  unidad: string
  comuna: string | null
}

// Traduce el valor del selector "tribunal:<id>" o "corte:<unidad>" (usado
// tanto por el traslado permanente como por el cargo transitorio) a los
// campos concretos que hay que guardar.
export function resolverDestino(
  destino: string,
  tribunales: FichaTribunal[],
  corteUnidadSeccion: Map<string, Seccion>,
): DestinoResuelto | null {
  if (!destino) return null
  const idx = destino.indexOf(':')
  const kind = destino.slice(0, idx)
  const ref = destino.slice(idx + 1)
  if (kind === 'tribunal') {
    const ficha = tribunales.find((t) => t.id === ref)
    if (!ficha) return null
    return { seccion: 'tribunal', tribunal: ficha.nombre, unidad: ficha.nombre, comuna: ficha.comuna }
  }
  if (kind === 'corte') {
    return {
      seccion: corteUnidadSeccion.get(ref) ?? 'corte',
      tribunal: 'Corte de Apelaciones de La Serena',
      unidad: ref,
      comuna: 'La Serena',
    }
  }
  return null
}

// Reconstruye el valor del selector a partir de datos ya guardados (para
// precargar el formulario al editar), buscando la ficha por nombre cuando
// el destino es un tribunal.
export function destinoActualComo(
  seccion: Seccion | null | undefined,
  tribunalNombre: string | null | undefined,
  unidadNombre: string | null | undefined,
  tribunales: FichaTribunal[],
): string {
  if (!tribunalNombre && !unidadNombre) return ''
  if (seccion === 'tribunal') {
    const ficha = tribunales.find((t) => t.nombre === tribunalNombre)
    return ficha ? `tribunal:${ficha.id}` : ''
  }
  return unidadNombre ? `corte:${unidadNombre}` : ''
}
