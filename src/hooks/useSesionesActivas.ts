import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const VENTANA_ACTIVO_MS = 60_000
const VENTANA_LIMPIEZA_MS = 5 * 60_000
const LATIDO_MS = 20_000

// Cuántas personas están usando el directorio en este momento (no el total
// histórico de visitas, ver useVisitas). Se cuenta como activa toda sesión
// con latido (ver useLatidoPropio) en el último minuto; sube y baja en vivo
// para todos apenas cambia, con el mismo mecanismo de tiempo real que ya usa
// el resto del directorio. enabled: solo se conecta cuando efectivamente se
// va a mostrar el contador (hoy, solo al administrador).
export function useSesionesActivas(enabled: boolean): number | null {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelado = false

    const recontar = () => {
      const limite = new Date(Date.now() - VENTANA_ACTIVO_MS).toISOString()
      supabase
        .from('sesiones_activas')
        .select('*', { count: 'exact', head: true })
        .gt('last_seen', limite)
        .then(({ count }) => {
          if (!cancelado) setTotal(count ?? 0)
        })
    }
    recontar()

    const channel = supabase
      .channel('sesiones-activas-en-vivo')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sesiones_activas' }, recontar)
      .subscribe()

    return () => {
      cancelado = true
      supabase.removeChannel(channel)
    }
  }, [enabled])

  return total
}

// Mantiene viva la propia sesión de este navegador (un latido cada 20
// segundos) mientras la pestaña esté abierta, y la borra al cerrarla. Se usa
// siempre, para cualquier visitante (no solo administradores), porque el
// conteo de "activos ahora" solo es real si todos avisan que siguen ahí.
export function useLatidoPropio(rol: 'viewer' | 'admin'): void {
  useEffect(() => {
    const clientId =
      'crypto' in window && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

    const latir = () => {
      supabase
        .from('sesiones_activas')
        .upsert({ id: clientId, rol, last_seen: new Date().toISOString() })
        .then(
          () => {},
          () => {},
        )
      // Aprovecha cada latido para limpiar sesiones abandonadas hace rato
      // (pestañas cerradas sin avisar, por ejemplo al perder la conexión).
      const limiteLimpieza = new Date(Date.now() - VENTANA_LIMPIEZA_MS).toISOString()
      supabase
        .from('sesiones_activas')
        .delete()
        .lt('last_seen', limiteLimpieza)
        .then(
          () => {},
          () => {},
        )
    }
    latir()
    const intervalo = setInterval(latir, LATIDO_MS)

    // El navegador no garantiza que este borrado alcance a completarse al
    // cerrar la pestaña; si no llega, la limpieza oportunista del próximo
    // latido de cualquier otra sesión la retira igual, unos minutos después.
    const salir = () => {
      supabase
        .from('sesiones_activas')
        .delete()
        .eq('id', clientId)
        .then(
          () => {},
          () => {},
        )
    }
    window.addEventListener('beforeunload', salir)

    return () => {
      clearInterval(intervalo)
      window.removeEventListener('beforeunload', salir)
      salir()
    }
  }, [rol])
}
