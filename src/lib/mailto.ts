import type { Persona } from '../types'
import { normalize } from './normalize'
import { perteneceASeccionCorte } from './sections'

// Grupos de correo masivo de la Corte de Apelaciones (incluye Insolvencia,
// ver perteneceASeccionCorte): cada uno de los 4 grupos "especiales" es
// mutuamente excluyente entre sí y con "Funcionarios" (todo el resto), y
// las casillas/anexos genéricos (esGenerico) nunca cuentan como persona.
const UNIDAD_FISCALIA = /fiscal/
const UNIDAD_RELATORES = /relator/

function esCorteEnviable(p: Persona): boolean {
  return perteneceASeccionCorte(p.seccion) && !p.esGenerico
}

export function esMinistroOPresidencia(p: Persona): boolean {
  if (!esCorteEnviable(p)) return false
  const u = normalize(p.unidad)
  return u === 'ministros' || u === 'presidencia'
}

export function esFiscalia(p: Persona): boolean {
  return esCorteEnviable(p) && UNIDAD_FISCALIA.test(normalize(p.unidad))
}

export function esRelator(p: Persona): boolean {
  return esCorteEnviable(p) && UNIDAD_RELATORES.test(normalize(p.unidad))
}

export function esAbogadoIntegrante(p: Persona): boolean {
  return esCorteEnviable(p) && normalize(p.unidad) === 'abogados integrantes'
}

export function esFuncionarioCorte(p: Persona): boolean {
  return (
    esCorteEnviable(p) &&
    !esMinistroOPresidencia(p) &&
    !esFiscalia(p) &&
    !esRelator(p) &&
    !esAbogadoIntegrante(p)
  )
}

export function esCualquieraDeCorte(p: Persona): boolean {
  return esCorteEnviable(p)
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
