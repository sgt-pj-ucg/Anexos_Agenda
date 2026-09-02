import { useCallback, useEffect, useState } from 'react'
import { loadFavorites, saveFavorites } from '../lib/favorites'

// validIds: ids de las personas que existen hoy en el directorio. Si alguien
// marcado como favorito fue eliminado o cambió de id (por ejemplo, al
// recrear su cargo), su id queda huérfano en localStorage: el contador
// seguía mostrando un favorito "fantasma" que no aparecía en ningún lado.
// Se limpia solo, apenas se conocen los ids vigentes.
export function useFavorites(validIds?: Set<string>) {
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites())

  useEffect(() => {
    if (!validIds) return
    setFavorites((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)))
      if (next.size === prev.size) return prev
      saveFavorites(next)
      return next
    })
  }, [validIds])

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveFavorites(next)
      return next
    })
  }, [])

  return { favorites, toggle }
}
