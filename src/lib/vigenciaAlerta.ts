const STORAGE_KEY = 'pj-la-serena-directorio-alerta-vigencia-vista'

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function alertaVigenciaDescartadaHoy(): boolean {
  return localStorage.getItem(STORAGE_KEY) === hoyIso()
}

export function descartarAlertaVigenciaHoy(): void {
  localStorage.setItem(STORAGE_KEY, hoyIso())
}
