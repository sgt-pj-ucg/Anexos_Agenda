// Formatea un RUT chileno mientras se escribe (puntos de miles + guión antes
// del dígito verificador), y lo normaliza (sin puntos, con guión) para
// compararlo/enviarlo al servidor.
function splitRut(raw: string): { body: string; dv: string } {
  const clean = raw.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length === 0) return { body: '', dv: '' }
  return { body: clean.slice(0, -1), dv: clean.slice(-1) }
}

export function formatRut(raw: string): string {
  const { body, dv } = splitRut(raw)
  if (!body) return dv
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${withDots}-${dv}`
}

export function normalizeRut(raw: string): string {
  const { body, dv } = splitRut(raw)
  if (!body) return dv
  return `${body}-${dv}`
}
