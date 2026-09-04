import { supabase } from './supabaseClient'

// Portón de acceso general del Directorio: una clave compartida para el
// público (independiente del sistema de administradores en auth.ts, que
// sigue funcionando exactamente igual). Se guarda en localStorage para que
// no vuelva a pedirse cada vez que se abre el sitio, igual que la sesión de
// administrador.
const ACCESO_KEY = 'pj-la-serena-directorio-acceso'
// "Bienvenida pendiente" vive en sessionStorage (no localStorage): solo debe
// aparecer una vez, justo después de entrar la clave, nunca en una recarga
// posterior con el acceso ya concedido.
const BIENVENIDA_KEY = 'pj-la-serena-directorio-bienvenida-pendiente'
// A qué sección (y, si corresponde, qué categoría externa) llevar apenas
// entra la app, cuando el visitante eligió una tarjeta en la bienvenida.
const DESTINO_KEY = 'pj-la-serena-directorio-destino-inicial'
// Evita registrar más de una visita por pestaña (ver registrarVisitaSiCorresponde).
const VISITA_KEY = 'pj-la-serena-directorio-visita-registrada'

const CLAVE_ACCESO_GENERAL = '0212'

export function tieneAccesoGeneral(): boolean {
  return localStorage.getItem(ACCESO_KEY) === 'ok'
}

export function claveAccesoGeneralValida(clave: string): boolean {
  return clave === CLAVE_ACCESO_GENERAL
}

// Se llama tanto al entrar con la clave general como al entrar como
// administrador (desde el mismo portón): en los dos casos queda "adentro" y
// corresponde mostrar la bienvenida una vez.
export function otorgarAccesoGeneral(): void {
  localStorage.setItem(ACCESO_KEY, 'ok')
  sessionStorage.setItem(BIENVENIDA_KEY, '1')
}

// Registra una visita (contador de uso, ver panel de administrador). Se
// llama una vez que la app ya está cargada (ver App.tsx), sin importar si el
// acceso venía de antes (localStorage) o se acaba de otorgar recién — así el
// contador sigue subiendo con cada apertura nueva del sitio, no solo la
// primera vez que alguien escribió la clave en ese navegador. sessionStorage
// evita contar de nuevo si la misma pestaña se recarga varias veces.
// Si falla (por ejemplo, sin conexión), no debe bloquear nada — por eso
// nunca se espera ni se propaga el error.
export function registrarVisitaSiCorresponde(rol: 'viewer' | 'admin'): void {
  if (sessionStorage.getItem(VISITA_KEY)) return
  sessionStorage.setItem(VISITA_KEY, '1')
  supabase
    .from('visitas')
    .insert({ rol })
    .then(
      () => {},
      () => {},
    )
}

// Cierra la sesión de acceso general: solo se llama cuando el funcionario lo
// pide explícitamente (botón "Cerrar sesión"), nunca automáticamente. Tras
// esto hace falta recargar para que el portón vuelva a aparecer.
export function cerrarAccesoGeneral(): void {
  localStorage.removeItem(ACCESO_KEY)
}

// Consulta pura, sin efecto secundario: puede llamarse varias veces (por
// ejemplo, en cada remontaje del portón) sin "gastar" la bienvenida antes de
// que realmente se haya mostrado.
export function hayBienvenidaPendiente(): boolean {
  return sessionStorage.getItem(BIENVENIDA_KEY) === '1'
}

// Se llama recién cuando el visitante termina de ver la bienvenida (elige
// una tarjeta): a partir de ahí, ni una recarga de la página vuelve a
// mostrarla dentro de la misma pestaña.
export function marcarBienvenidaMostrada(): void {
  sessionStorage.removeItem(BIENVENIDA_KEY)
}

export interface DestinoInicial {
  section?: string
  externo?: boolean
  categoriaExterna?: string
}

export function elegirDestinoInicial(destino: DestinoInicial): void {
  sessionStorage.setItem(DESTINO_KEY, JSON.stringify(destino))
}

export function tomarDestinoInicial(): DestinoInicial | null {
  const crudo = sessionStorage.getItem(DESTINO_KEY)
  if (!crudo) return null
  sessionStorage.removeItem(DESTINO_KEY)
  try {
    return JSON.parse(crudo) as DestinoInicial
  } catch {
    return null
  }
}
