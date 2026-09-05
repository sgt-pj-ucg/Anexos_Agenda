import { useMemo, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Mail, Plus, Search, Trash2, X } from 'lucide-react'
import type { FichaTribunal, GrupoCorreo, GrupoCorreoMiembro, Persona } from '../types'
import { collectGroupContacts } from '../lib/mailto'
import { normalize } from '../lib/normalize'

interface OpcionDirectorio {
  id: string
  nombre: string
  correo: string
  contexto: string
}

// Fuente de sugerencias al escribir: personas del directorio (con su correo
// principal) y tribunales (con su correo institucional general) — así se
// puede armar un grupo mezclando funcionarios puntuales con casillas
// genéricas de juzgados, como en el ejemplo real "Jurisdicción Quiebras".
function construirOpciones(people: Persona[], tribunales: FichaTribunal[]): OpcionDirectorio[] {
  const personas = collectGroupContacts(people).map((c) => ({
    id: `p-${c.id}`,
    nombre: c.nombre,
    correo: c.correo,
    contexto: c.unidad,
  }))
  const trib = tribunales
    .filter((t): t is FichaTribunal & { correo: string } => Boolean(t.correo))
    .map((t) => ({
      id: `t-${t.id}`,
      nombre: t.nombre,
      correo: t.correo,
      contexto: 'Tribunal',
    }))
  return [...personas, ...trib]
}

export function GrupoCorreoEditorModal({
  grupo,
  people,
  tribunales,
  onCancel,
  onSubmit,
}: {
  grupo?: GrupoCorreo
  people: Persona[]
  tribunales: FichaTribunal[]
  onCancel: () => void
  onSubmit: (values: { id?: string; nombre: string; miembros: GrupoCorreoMiembro[] }) => void
}) {
  const [nombre, setNombre] = useState(grupo?.nombre ?? '')
  const [miembros, setMiembros] = useState<GrupoCorreoMiembro[]>(grupo?.miembros ?? [])
  const [busqueda, setBusqueda] = useState('')
  const [correoManual, setCorreoManual] = useState('')
  const [nombreManual, setNombreManual] = useState('')

  const opciones = useMemo(() => construirOpciones(people, tribunales), [people, tribunales])
  const correosYaAgregados = useMemo(() => new Set(miembros.map((m) => m.correo.toLowerCase())), [miembros])

  const sugerencias = useMemo(() => {
    const tokens = normalize(busqueda).split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return []
    return opciones
      .filter((o) => !correosYaAgregados.has(o.correo.toLowerCase()))
      .filter((o) => {
        const all = normalize([o.nombre, o.correo, o.contexto].join(' '))
        return tokens.every((t) => all.includes(t))
      })
      .slice(0, 8)
  }, [opciones, busqueda, correosYaAgregados])

  const agregarMiembro = (m: GrupoCorreoMiembro) => {
    if (correosYaAgregados.has(m.correo.toLowerCase())) return
    setMiembros((prev) => [...prev, m])
  }

  const quitarMiembro = (correo: string) => setMiembros((prev) => prev.filter((m) => m.correo !== correo))

  const agregarManual = () => {
    const correo = correoManual.trim()
    if (!correo) return
    agregarMiembro({ correo, nombre: nombreManual.trim() || null })
    setCorreoManual('')
    setNombreManual('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || miembros.length === 0) return
    onSubmit({ id: grupo?.id, nombre: nombre.trim(), miembros })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onMouseDown={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-in flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white">
              <Mail size={18} />
            </div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {grupo ? 'Editar grupo' : 'Crear grupo'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-300">
              Nombre del grupo
            </span>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Jurisdicción Quiebras"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-violet-500/10"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-300">
              Agregar del directorio
            </span>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Busca por nombre de persona o tribunal…"
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-violet-500/10"
              />
            </div>
            {sugerencias.length > 0 && (
              <ul className="mt-1.5 max-h-40 space-y-0.5 overflow-y-auto rounded-xl border border-slate-100 p-1 dark:border-slate-700">
                {sugerencias.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => {
                        agregarMiembro({ correo: o.correo, nombre: o.nombre })
                        setBusqueda('')
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-violet-50 dark:hover:bg-violet-500/10"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-800 dark:text-slate-100">
                          {o.nombre}
                        </span>
                        <span className="block truncate text-xs text-slate-400">
                          {o.contexto} · {o.correo}
                        </span>
                      </span>
                      <Plus size={14} className="shrink-0 text-violet-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-300">
              O agregar un correo suelto
            </span>
            <div className="flex flex-wrap gap-1.5">
              <input
                value={nombreManual}
                onChange={(e) => setNombreManual(e.target.value)}
                placeholder="Nombre (opcional)"
                className="min-w-[120px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-violet-500/10"
              />
              <input
                value={correoManual}
                onChange={(e) => setCorreoManual(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    agregarManual()
                  }
                }}
                placeholder="correo@ejemplo.cl"
                className="min-w-[160px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-violet-500/10"
              />
              <button
                type="button"
                onClick={agregarManual}
                disabled={!correoManual.trim()}
                className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={14} />
                Agregar
              </button>
            </div>
          </div>

          <div>
            <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-300">
              Integrantes del grupo
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-slate-700">
                {miembros.length}
              </span>
            </span>
            {miembros.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
                Todavía no agregas ningún correo.
              </p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto">
                {miembros.map((m) => (
                  <li
                    key={m.correo}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-700"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {m.nombre ?? m.correo}
                      </span>
                      {m.nombre && <span className="block truncate text-xs text-slate-400">{m.correo}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => quitarMiembro(m.correo)}
                      title="Quitar del grupo"
                      className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!nombre.trim() || miembros.length === 0}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
