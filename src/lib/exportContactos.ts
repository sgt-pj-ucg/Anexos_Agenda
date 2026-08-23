import type { ContactoExterno, Persona } from '../types'

export interface ExportTable {
  headers: string[]
  rows: string[][]
}

function celda(valor: string | null | undefined): string {
  return valor?.trim() ?? ''
}

export function personasToTable(people: Persona[]): ExportTable {
  return {
    headers: ['Nombre', 'Cargo', 'Unidad', 'Comuna', 'Correo(s)', 'Anexo'],
    rows: people
      .filter((p) => !p.vacante)
      .map((p) => [celda(p.nombre), celda(p.cargo), celda(p.unidad), celda(p.comuna), p.correos.join('; '), celda(p.anexo)]),
  }
}

export function contactosExternosToTable(contactos: ContactoExterno[]): ExportTable {
  return {
    headers: ['Institución', 'Nombre', 'Cargo', 'Comuna', 'Correo(s)', 'Teléfono(s)', 'Dirección'],
    rows: contactos.map((c) => [
      celda(c.institucion),
      celda(c.nombre),
      celda(c.cargo),
      celda(c.comuna),
      c.correos.join('; '),
      c.telefonos.join('; '),
      celda(c.direccion),
    ]),
  }
}

export function slugArchivo(texto: string): string {
  const limpio = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return limpio || 'directorio'
}

function csvCelda(valor: string): string {
  if (/[",\r\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`
  return valor
}

function descargarBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Prefijo BOM para que Excel detecte UTF-8 y muestre bien tildes y "ñ" al
// abrir el archivo con doble clic, sin necesidad de importar manualmente.
export function descargarCsv(filename: string, tabla: ExportTable): void {
  const lineas = [tabla.headers, ...tabla.rows].map((fila) => fila.map(csvCelda).join(','))
  const contenido = '﻿' + lineas.join('\r\n')
  descargarBlob(new Blob([contenido], { type: 'text/csv;charset=utf-8' }), filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

function escapeHtml(valor: string): string {
  return valor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function exportarPdf(titulo: string, tabla: ExportTable): void {
  const ventana = window.open('', '_blank', 'width=1000,height=800')
  if (!ventana) {
    window.alert('El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para exportar a PDF.')
    return
  }
  const fecha = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
  const encabezados = tabla.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
  const filas = tabla.rows
    .map((fila) => `<tr>${fila.map((c) => `<td>${escapeHtml(c) || '—'}</td>`).join('')}</tr>`)
    .join('')
  ventana.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(titulo)}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; padding: 24px; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  p.subtitle { font-size: 12px; color: #64748b; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 600; }
  tr:nth-child(even) td { background: #f8fafc; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>${escapeHtml(titulo)}</h1>
  <p class="subtitle">Directorio Jurisdiccional · Corte de Apelaciones de La Serena · Exportado el ${fecha} · ${tabla.rows.length} registros</p>
  <table>
    <thead><tr>${encabezados}</tr></thead>
    <tbody>${filas}</tbody>
  </table>
</body>
</html>`)
  ventana.document.close()
  ventana.focus()
  // document.write es síncrono, pero el layout aún puede no estar listo:
  // se da un pequeño margen antes de abrir el diálogo de impresión.
  setTimeout(() => ventana.print(), 250)
}
