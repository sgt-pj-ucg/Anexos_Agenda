import type { Persona } from '../types'

export function collectGroupEmails(people: Persona[]): string[] {
  const emails = new Set<string>()
  for (const p of people) {
    if (p.vacante || p.correos.length === 0) continue
    const institucional = p.correos.find((e) => e.endsWith('@pjud.cl'))
    emails.add(institucional ?? p.correos[0])
  }
  return Array.from(emails)
}

export function buildGroupMailto(emails: string[]): string {
  return `mailto:?bcc=${encodeURIComponent(emails.join(','))}`
}
