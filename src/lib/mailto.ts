import type { Persona } from '../types'
import { normalize } from './normalize'
import { perteneceASeccionCorte } from './sections'

// Para el envío masivo a "funcionarios" de la Corte: quedan fuera los
// ministros, relatores y fiscalías judiciales (tienen su propio grupo, ver
// esMinistroRelatorFiscal), y las casillas/anexos genéricos (esGenerico),
// que no son una persona.
const UNIDAD_MINISTRO_RELATOR_FISCAL = /(ministro|relator|fiscal)/

export function esFuncionarioCorte(p: Persona): boolean {
  return perteneceASeccionCorte(p.seccion) && !p.esGenerico && !UNIDAD_MINISTRO_RELATOR_FISCAL.test(normalize(p.unidad))
}

export function esMinistroRelatorFiscal(p: Persona): boolean {
  return perteneceASeccionCorte(p.seccion) && !p.esGenerico && UNIDAD_MINISTRO_RELATOR_FISCAL.test(normalize(p.unidad))
}

export function collectGroupEmails(people: Persona[]): string[] {
  // Se ordena por nombre antes de extraer los correos para que, al revisar
  // los destinatarios en el cliente de correo, sea fácil comprobar cada
  // nombre contra su dirección (en vez de un orden arbitrario).
  const ordenados = [...people].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  const emails = new Set<string>()
  for (const p of ordenados) {
    if (p.vacante || p.correos.length === 0) continue
    const institucional = p.correos.find((e) => e.endsWith('@pjud.cl'))
    emails.add(institucional ?? p.correos[0])
  }
  return Array.from(emails)
}

export function buildGroupMailto(emails: string[]): string {
  // Se colocan como destinatarios directos (Para), no en copia oculta:
  // así el cliente de correo los muestra uno a uno, en el mismo orden en
  // que se armaron, facilitando revisar y corregir alguno si hace falta.
  return `mailto:${emails.join(',')}`
}
