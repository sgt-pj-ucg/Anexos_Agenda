import type { Persona } from '../types'
import { normalize } from './normalize'

// Para el envío masivo a "funcionarios" de la Corte: quedan fuera los
// ministros, relatores y fiscalías judiciales (son grupos con su propio
// canal), y las casillas generales (esGenerico), que no son una persona.
const UNIDAD_EXCLUIDA_FUNCIONARIOS = /(ministro|relator|fiscal)/

export function esFuncionarioCorte(p: Persona): boolean {
  return p.seccion === 'corte' && !p.esGenerico && !UNIDAD_EXCLUIDA_FUNCIONARIOS.test(normalize(p.unidad))
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
