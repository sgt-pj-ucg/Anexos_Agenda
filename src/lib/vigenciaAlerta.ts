import { hoyChile } from './fechaChile'

const STORAGE_KEY = 'pj-la-serena-directorio-alerta-vigencia-vista'

export function alertaVigenciaDescartadaHoy(): boolean {
  return localStorage.getItem(STORAGE_KEY) === hoyChile()
}

export function descartarAlertaVigenciaHoy(): void {
  localStorage.setItem(STORAGE_KEY, hoyChile())
}
