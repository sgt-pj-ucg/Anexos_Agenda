import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Contador de visitas: total de veces que alguien entró por el portón de
// acceso (ver accessGate.ts). Sube en vivo, sin recargar, apenas alguien
// más entra desde cualquier otro computador — usa el mismo mecanismo de
// tiempo real que el resto del directorio (ver useDirectorioData).
// enabled: solo se conecta cuando efectivamente se va a mostrar el contador
// (hoy, solo al administrador), para no abrir una suscripción de más a
// cada visitante del público.
export function useVisitas(enabled: boolean): number | null {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelado = false

    supabase
      .from('visitas')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => {
        if (!cancelado) setTotal(count ?? 0)
      })

    const channel = supabase
      .channel('visitas-en-vivo')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitas' }, () => {
        setTotal((prev) => (prev ?? 0) + 1)
      })
      .subscribe()

    return () => {
      cancelado = true
      supabase.removeChannel(channel)
    }
  }, [enabled])

  return total
}
