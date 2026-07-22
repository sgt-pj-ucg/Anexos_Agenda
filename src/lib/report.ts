// Correo de la coordinación que recibe los avisos de datos incorrectos o
// desactualizados. Fácil de cambiar si en el futuro debe llegar a otra casilla.
const REPORT_EMAIL = 'jolave@pjud.cl'

export function buildReportMailto(subject: string, contexto: string[], descripcion: string): string {
  const body = [...contexto.filter(Boolean), '', 'Descripción del problema:', descripcion].join('\n')
  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(`Dato incorrecto: ${subject}`)}&body=${encodeURIComponent(body)}`
}
