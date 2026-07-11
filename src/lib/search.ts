import Fuse from 'fuse.js'
import type { Persona } from '../types'
import { normalize } from './normalize'

export interface SearchDoc extends Persona {
  _search: string
}

export function buildSearchIndex(people: Persona[]) {
  const docs: SearchDoc[] = people.map((p) => ({
    ...p,
    _search: normalize(
      [p.nombre, p.cargo, p.unidad, p.tribunal, p.correos.join(' '), p.anexo, p.rut, p.comuna]
        .filter(Boolean)
        .join(' '),
    ),
  }))
  return new Fuse(docs, {
    keys: ['_search'],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
  })
}
