import { Cake, X } from 'lucide-react'
import { useState } from 'react'
import type { Persona } from '../types'

export function BirthdayBanner({ people }: { people: Persona[] }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || people.length === 0) return null
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <Cake size={18} className="shrink-0" />
      <p className="flex-1">
        <strong className="font-semibold">Hoy cumple{people.length > 1 ? 'n' : ''} años:</strong>{' '}
        {people.map((p) => p.nombre).join(', ')}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-full p-1 hover:bg-amber-100 dark:hover:bg-amber-500/20"
        title="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  )
}
