import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { ContactoExterno } from '../types'
import { CATEGORIA_META, CATEGORIA_ORDER } from '../lib/contactosExternos'
import { normalize } from '../lib/normalize'
import { ContactoExternoCard } from './ContactoExternoCard'

export function ContactosExternosView({ contactos }: { contactos: ContactoExterno[] }) {
  const [categoria, setCategoria] = useState(CATEGORIA_ORDER[0])
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const item of contactos) c[item.categoria] = (c[item.categoria] ?? 0) + 1
    return c
  }, [contactos])

  const enCategoria = useMemo(
    () => contactos.filter((c) => c.categoria === categoria),
    [contactos, categoria],
  )

  const trimmed = query.trim()
  const filtrados = useMemo(() => {
    if (!trimmed) return enCategoria
    const q = normalize(trimmed)
    return enCategoria.filter((c) =>
      [c.nombre, c.institucion, c.cargo, c.comuna, ...c.correos, ...c.telefonos]
        .filter(Boolean)
        .some((v) => normalize(v as string).includes(q)),
    )
  }, [enCategoria, trimmed])

  const grupos = useMemo(() => {
    // Se agrupa por comuna cuando existe (algunas instituciones, como
    // "Primera Notaría", se repiten en varias comunas y no deben mezclarse).
    const map = new Map<string, ContactoExterno[]>()
    for (const c of filtrados) {
      const key = c.comuna ?? c.institucion ?? 'Otros'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return Array.from(map.entries())
  }, [filtrados])

  const meta = CATEGORIA_META[categoria]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CATEGORIA_ORDER.map((key) => {
          const m = CATEGORIA_META[key]
          const Icon = m.icon
          const active = key === categoria
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setCategoria(key)
                setQuery('')
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-800'
              }`}
            >
              <Icon size={15} />
              {m.short}
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[11px] ${
                  active ? 'bg-white/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {counts[key] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">{meta.description}</p>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Busca en ${meta.label.toLowerCase()} por nombre, comuna, correo...`}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-500/10"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
          Sin resultados para tu búsqueda.
        </p>
      ) : (
        <div className="space-y-4">
          {grupos.map(([grupo, items]) => (
            <div key={grupo} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-500/5">
              <p className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                {grupo}
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                  {items.length}
                </span>
              </p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {items.map((c) => (
                  <ContactoExternoCard
                    key={c.id}
                    contacto={c}
                    subLabel={c.institucion && c.institucion !== grupo ? c.institucion : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
