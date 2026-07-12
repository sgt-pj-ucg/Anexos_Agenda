const DIACRITICS = /[̀-ͯ]/g

export function normalize(s: string | null | undefined): string {
  if (!s) return ''
  return s.normalize('NFD').replace(DIACRITICS, '').toLowerCase().trim()
}

export function slugify(s: string): string {
  return normalize(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
