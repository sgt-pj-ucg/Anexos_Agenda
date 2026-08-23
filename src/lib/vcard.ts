import type { Persona } from '../types'
import { anexoDigits } from './format'

function vcardEscape(valor: string): string {
  return valor.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

// Convención chilena: [nombre(s)] [apellido paterno] [apellido materno]. El
// "apellido" por el que se ordena la tarjeta es el penúltimo término, igual
// que en lib/format.ts.
function separarNombre(nombre: string): { nombrePila: string; apellido: string } {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length <= 1) return { nombrePila: nombre, apellido: '' }
  const apellidoIndex = partes.length >= 3 ? partes.length - 2 : partes.length - 1
  return {
    nombrePila: partes.slice(0, apellidoIndex).join(' '),
    apellido: partes[apellidoIndex],
  }
}

export function buildVCard(p: Persona): string {
  const { nombrePila, apellido } = separarNombre(p.nombre)
  const organizacion = [p.tribunal, p.unidad].filter((v, i, arr) => v && arr.indexOf(v) === i).join(' - ') || 'Poder Judicial de Chile'

  const lineas = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${vcardEscape(apellido)};${vcardEscape(nombrePila)};;;`,
    `FN:${vcardEscape(p.nombre)}`,
    `ORG:${vcardEscape(organizacion)}`,
  ]
  if (p.cargo) lineas.push(`TITLE:${vcardEscape(p.cargo)}`)
  for (const correo of p.correos) lineas.push(`EMAIL;TYPE=WORK:${vcardEscape(correo)}`)
  const digitos = anexoDigits(p.anexo)
  if (digitos) lineas.push(`TEL;TYPE=WORK:${digitos}`)
  if (p.comuna) lineas.push(`ADR;TYPE=WORK:;;;${vcardEscape(p.comuna)};;;Chile`)
  lineas.push('END:VCARD')
  return lineas.join('\r\n')
}

export function contactoTexto(p: Persona): string {
  const lineas = [p.nombre]
  if (p.cargo) lineas.push(p.cargo)
  const organizacion = [p.tribunal, p.unidad].filter((v, i, arr) => v && arr.indexOf(v) === i).join(' - ')
  if (organizacion) lineas.push(organizacion)
  for (const correo of p.correos) lineas.push(correo)
  if (p.anexo) lineas.push(`Anexo ${p.anexo}`)
  if (p.comuna) lineas.push(p.comuna)
  return lineas.join('\n')
}

export function descargarVCard(p: Persona): void {
  const blob = new Blob([buildVCard(p)], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const nombreArchivo = p.nombre.replace(/[^\p{L}\p{N} ]+/gu, '').trim() || 'contacto'
  a.download = `${nombreArchivo}.vcf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
