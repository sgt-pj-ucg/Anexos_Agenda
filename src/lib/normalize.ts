const DIACRITICS = /[̀-ͯ]/g

export function normalize(s: string | null | undefined): string {
  if (!s) return ''
  return s.normalize('NFD').replace(DIACRITICS, '').toLowerCase().trim()
}
