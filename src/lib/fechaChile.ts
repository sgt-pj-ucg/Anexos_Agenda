// Fecha de "hoy" en la zona horaria de Chile (America/Santiago), no la del
// reloj UTC del navegador: la vigencia de los cargos se define por el
// calendario chileno. Usar la fecha UTC directamente adelantaba el cambio
// de día varias horas (ej. a las 21:00 en Chile, en UTC ya es el día
// siguiente), lo que hacía aparecer o vencer cargos antes de tiempo.
export function hoyChile(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

// Suma (o resta) días de calendario a una fecha "YYYY-MM-DD", sin
// depender de la hora ni la zona horaria local del navegador.
export function addDiasIso(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + delta)
  return date.toISOString().slice(0, 10)
}
