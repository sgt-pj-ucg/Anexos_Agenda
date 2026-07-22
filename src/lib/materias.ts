export const MATERIA_ORDER = ['Civil', 'Penal', 'Reformado', 'Laboral', 'Cobranza', 'Familia']

export function materiaRank(m: string): number {
  const i = MATERIA_ORDER.indexOf(m)
  return i === -1 ? 999 : i
}
