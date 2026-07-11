export const COMUNA_ORDER = [
  'La Serena',
  'Coquimbo',
  'Ovalle',
  'Illapel',
  'Vicuña',
  'Combarbalá',
  'Los Vilos',
  'Andacollo',
]

export function comunaRank(c: string | null | undefined): number {
  if (!c) return 999
  const i = COMUNA_ORDER.indexOf(c)
  return i === -1 ? 999 : i
}
