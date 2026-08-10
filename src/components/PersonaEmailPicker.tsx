import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, User } from 'lucide-react'
import type { Persona } from '../types'
import { normalize } from '../lib/normalize'

interface Props {
  personas: Persona[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PersonaEmailPicker({ personas, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const candidatos = useMemo(() => {
    const conCorreo = personas.filter((p) => p.correos.length > 0)
    const q = normalize(query)
    if (!q) return conCorreo.slice(0, 8)
    return conCorreo
      .filter((p) => normalize(p.nombre).includes(q) || normalize(p.cargo).includes(q))
      .slice(0, 8)
  }, [personas, query])

  const seleccionado = useMemo(
    () => personas.find((p) => p.correos.includes(value)),
    [personas, value],
  )

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={open ? query : value}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => {
            setQuery('')
            setOpen(true)
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/10"
        />
      </div>

      {open && candidatos.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {candidatos.map((p) => (
            <button
              type="button"
              key={p.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(p.correos[0])
                setQuery('')
                setOpen(false)
              }}
              className="flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
            >
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.nombre}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {p.cargo ?? 'Sin cargo'} · {p.correos[0]}
              </span>
            </button>
          ))}
        </div>
      )}

      {seleccionado && (
        <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <User size={11} /> {seleccionado.nombre} · {seleccionado.cargo ?? 'Sin cargo'}
        </p>
      )}
    </div>
  )
}
