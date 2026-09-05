import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  Check,
  Copy,
  Mail,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import type { GrupoCorreo } from '../types'
import { buildGroupMailto } from '../lib/mailto'
import { normalize } from '../lib/normalize'
import { avatarPalette, initials } from '../lib/format'
import { useCopy } from '../hooks/useCopy'

function ListaGrupos({
  grupos,
  isAdmin,
  onAbrir,
  onCrear,
  onEditar,
  onEliminar,
  onClose,
}: {
  grupos: GrupoCorreo[]
  isAdmin: boolean
  onAbrir: (grupo: GrupoCorreo) => void
  onCrear: () => void
  onEditar: (grupo: GrupoCorreo) => void
  onEliminar: (grupo: GrupoCorreo) => void
  onClose: () => void
}) {
  const [busqueda, setBusqueda] = useState('')

  const gruposFiltrados = useMemo(() => {
    const tokens = normalize(busqueda).split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return grupos
    return grupos.filter((g) => tokens.every((t) => normalize(g.nombre).includes(t)))
  }, [grupos, busqueda])

  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-[0_8px_16px_-6px_rgba(124,58,237,.55)]">
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Grupos de Correos Especiales</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Listas de correo para envíos que se repiten seguido
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={onCrear}
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:border-violet-400 hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/15"
            >
              <Plus size={13} />
              Crear grupo
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {grupos.length > 1 && (
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={15} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar grupo por nombre…"
              className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-violet-500/10"
            />
          </div>
        </div>
      )}

      <div className="max-h-[580px] flex-1 overflow-y-auto p-4">
        {grupos.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
            Todavía no hay grupos de correos especiales.
          </p>
        ) : gruposFiltrados.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
            Ningún grupo coincide con "{busqueda}".
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gruposFiltrados.map((g) => (
              <div
                key={g.id}
                className="group relative flex flex-col gap-2 rounded-2xl border border-violet-100 bg-violet-50/50 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_14px_28px_-16px_rgba(124,58,237,.5)] dark:border-violet-900/40 dark:bg-violet-500/5"
              >
                <button type="button" onClick={() => onAbrir(g)} className="flex min-w-0 items-center gap-3 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
                    <Users size={17} />
                  </span>
                  <span title={g.nombre} className="min-w-0 flex-1 truncate font-semibold text-slate-900 dark:text-white">
                    {g.nombre}
                  </span>
                </button>
                <div className="flex items-center justify-between pl-[52px]">
                  <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    {g.miembros.length} {g.miembros.length === 1 ? 'correo' : 'correos'}
                  </span>
                  {isAdmin && (
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onEditar(g)}
                        title="Editar grupo"
                        className="rounded-full p-1.5 text-violet-400 hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-500/15"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEliminar(g)}
                        title="Eliminar grupo"
                        className="rounded-full p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function GrupoDetalle({
  grupo,
  isAdmin,
  onVolver,
  onEditar,
  onClose,
}: {
  grupo: GrupoCorreo
  isAdmin: boolean
  onVolver: () => void
  onEditar: () => void
  onClose: () => void
}) {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(
    () => new Set(grupo.miembros.map((m) => m.correo)),
  )
  const [query, setQuery] = useState('')
  const { copied, copy } = useCopy()

  const filtrados = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return grupo.miembros
    return grupo.miembros.filter((m) => {
      const all = normalize([m.nombre, m.correo].filter(Boolean).join(' '))
      return tokens.every((t) => all.includes(t))
    })
  }, [grupo.miembros, query])

  const toggle = (correo: string) =>
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(correo)) next.delete(correo)
      else next.add(correo)
      return next
    })

  const emailsSeleccionados = grupo.miembros.filter((m) => seleccionados.has(m.correo)).map((m) => m.correo)
  const joined = emailsSeleccionados.join(', ')

  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVolver}
            title="Volver a la lista de grupos"
            className="shrink-0 rounded-full border border-slate-200 p-2 text-slate-500 hover:border-violet-200 hover:text-violet-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-800"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white">
            <Mail size={19} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{grupo.nombre}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {seleccionados.size} de {grupo.miembros.length} seleccionados
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isAdmin && (
            <button
              type="button"
              onClick={onEditar}
              title="Editar este grupo"
              className="rounded-full p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-500/10"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={15} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-violet-500/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtrados.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
            Ningún destinatario coincide con "{query}".
          </p>
        ) : (
          <ul className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {filtrados.map((m) => {
              const marcado = seleccionados.has(m.correo)
              return (
                <li key={m.correo}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => toggle(m.correo)}
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-400 dark:border-slate-600"
                    />
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-opacity ${avatarPalette(m.correo)} ${marcado ? '' : 'opacity-40'}`}
                    >
                      {m.nombre ? initials(m.nombre) : <Mail size={14} />}
                    </div>
                    <div className={`min-w-0 flex-1 transition-opacity ${marcado ? '' : 'opacity-40'}`}>
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {m.nombre ?? m.correo}
                      </p>
                      {m.nombre && (
                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">{m.correo}</p>
                      )}
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Se enviará a los {seleccionados.size} destinatarios marcados.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={emailsSeleccionados.length === 0}
            onClick={() => copy(joined)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied === joined ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            Copiar direcciones
          </button>
          <a
            href={emailsSeleccionados.length > 0 ? buildGroupMailto(emailsSeleccionados) : undefined}
            aria-disabled={emailsSeleccionados.length === 0}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${
              emailsSeleccionados.length === 0
                ? 'pointer-events-none cursor-not-allowed bg-violet-300'
                : 'bg-violet-600 hover:bg-violet-700'
            }`}
          >
            <Send size={15} />
            Enviar correo ({emailsSeleccionados.length})
          </a>
        </div>
      </div>
    </>
  )
}

export function GruposCorreoModal({
  grupos,
  isAdmin,
  onClose,
  onCrear,
  onEditar,
  onEliminar,
}: {
  grupos: GrupoCorreo[]
  isAdmin: boolean
  onClose: () => void
  onCrear: () => void
  onEditar: (grupo: GrupoCorreo) => void
  onEliminar: (grupo: GrupoCorreo) => void
}) {
  const [grupoAbiertoId, setGrupoAbiertoId] = useState<string | null>(null)
  const grupoAbierto = grupos.find((g) => g.id === grupoAbiertoId) ?? null
  const [grupoAEliminar, setGrupoAEliminar] = useState<GrupoCorreo | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (grupoAEliminar) setGrupoAEliminar(null)
      else if (grupoAbiertoId) setGrupoAbiertoId(null)
      else onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, grupoAbiertoId, grupoAEliminar])

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`animate-fade-in relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-[max-width] duration-300 dark:border-slate-700 dark:bg-slate-900 ${
          grupoAbierto ? 'max-w-2xl' : 'max-w-4xl'
        }`}
      >
        {grupoAbierto ? (
          <GrupoDetalle
            grupo={grupoAbierto}
            isAdmin={isAdmin}
            onVolver={() => setGrupoAbiertoId(null)}
            onEditar={() => onEditar(grupoAbierto)}
            onClose={onClose}
          />
        ) : (
          <ListaGrupos
            grupos={grupos}
            isAdmin={isAdmin}
            onAbrir={(g) => setGrupoAbiertoId(g.id)}
            onCrear={onCrear}
            onEditar={onEditar}
            onEliminar={setGrupoAEliminar}
            onClose={onClose}
          />
        )}

        {grupoAEliminar && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onMouseDown={() => setGrupoAEliminar(null)}
          >
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="animate-fade-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="mb-1 font-semibold text-slate-900 dark:text-white">¿Eliminar este grupo?</p>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                "{grupoAEliminar.nombre}" y sus {grupoAEliminar.miembros.length} correos se eliminarán por
                completo. Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGrupoAEliminar(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onEliminar(grupoAEliminar)
                    setGrupoAEliminar(null)
                  }}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
