import type { Persona } from '../types'
import type { SeccionKey } from './sections'
import { comunaRank } from './comunas'
import type { Group } from '../components/GroupedResults'

export function buildGroups(section: SeccionKey, people: Persona[]): Group[] {
  const map = new Map<string, Group>()
  for (const p of people) {
    const key = p.unidad
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: p.unidad,
        people: [],
        ficha: section === 'tribunal' ? p.fichaTribunal : null,
      })
    }
    map.get(key)!.people.push(p)
  }

  const groups = Array.from(map.values())

  if (section === 'tribunal') {
    for (const g of groups) g.people.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    groups.sort((a, b) => {
      const ca = comunaRank(a.people[0]?.comuna)
      const cb = comunaRank(b.people[0]?.comuna)
      return ca - cb || a.label.localeCompare(b.label, 'es')
    })
  }

  return groups
}
