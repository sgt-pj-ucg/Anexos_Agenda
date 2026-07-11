import type { Persona } from '../types'
import { normalize } from './normalize'

export interface SearchDoc {
  persona: Persona
  nombre: string
  all: string
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildSearchIndex(people: Persona[]): SearchDoc[] {
  return people.map((p) => ({
    persona: p,
    nombre: normalize(p.nombre),
    all: normalize(
      [p.nombre, p.cargo, p.unidad, p.tribunal, p.correos.join(' '), p.anexo, p.comuna]
        .filter(Boolean)
        .join(' '),
    ),
  }))
}

/**
 * Búsqueda por palabras independientes: cada palabra escrita debe aparecer
 * en algún campo de la persona (nombre, cargo, unidad, tribunal, correo,
 * anexo o comuna), sin importar el orden ni si están separadas por otras
 * palabras (p.ej. "juan olave" encuentra a "Juan Carlos Olave Soto").
 */
export function searchPeople(index: SearchDoc[], query: string): Persona[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  const scored: { persona: Persona; score: number }[] = []
  for (const doc of index) {
    let score = 0
    let matchesAll = true
    for (const token of tokens) {
      if (doc.nombre.includes(token)) {
        score += 3
        if (new RegExp(`(^|\\s)${escapeRegExp(token)}`).test(doc.nombre)) score += 2
      } else if (doc.all.includes(token)) {
        score += 1
      } else {
        matchesAll = false
        break
      }
    }
    if (matchesAll) scored.push({ persona: doc.persona, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.map((s) => s.persona)
}
