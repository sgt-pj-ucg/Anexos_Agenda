import { useMemo } from 'react'
import { UserPlus } from 'lucide-react'
import type { CategoriaExterna, ContactoExterno } from '../types'
import { buscarContactosExternos, CATEGORIA_META, CATEGORIA_ORDER } from '../lib/contactosExternos'
import { ContactoExternoCard } from './ContactoExternoCard'
import { EmptyState } from './EmptyState'
import { useIsAdmin } from '../context/RoleContext'

export function ContactosExternosView({
  contactos,
  categoria,
  onChangeCategoria,
  query,
  onEditContacto,
  onDeleteContacto,
  onReportContacto,
  onAddContacto,
}: {
  contactos: ContactoExterno[]
  categoria: CategoriaExterna
  onChangeCategoria: (categoria: CategoriaExterna) => void
  query: string
  onEditContacto?: (contacto: ContactoExterno) => void
  onDeleteContacto?: (contacto: ContactoExterno) => void
  onReportContacto?: (contacto: ContactoExterno) => void
  onAddContacto?: (categoria: CategoriaExterna) => void
}) {
  const isAdmin = useIsAdmin()
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const item of contactos) c[item.categoria] = (c[item.categoria] ?? 0) + 1
    return c
  }, [contactos])

  const enCategoria = useMemo(
    () => contactos.filter((c) => c.categoria === categoria),
    [contactos, categoria],
  )

  const filtrados = useMemo(() => buscarContactosExternos(enCategoria, query), [enCategoria, query])

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
              onClick={() => onChangeCategoria(key)}
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">{meta.description}</p>
        {isAdmin && onAddContacto && (
          <button
            type="button"
            onClick={() => onAddContacto(categoria)}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
          >
            <UserPlus size={12} />
            Agregar contacto
          </button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <EmptyState query={query} />
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
                    onEdit={onEditContacto ? () => onEditContacto(c) : undefined}
                    onDelete={onDeleteContacto ? () => onDeleteContacto(c) : undefined}
                    onReport={onReportContacto ? () => onReportContacto(c) : undefined}
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
