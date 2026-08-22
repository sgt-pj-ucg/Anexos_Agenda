import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Search, Send, Users, X } from 'lucide-react'
import type { GroupContact } from '../lib/mailto'
import { buildGroupMailto } from '../lib/mailto'
import { normalize } from '../lib/normalize'
import { avatarPalette, initials } from '../lib/format'
import { useCopy } from '../hooks/useCopy'

export function FuncionariosCorteModal({
  contactos,
  onClose,
}: {
  contactos: GroupContact[]
  onClose: () => void
}) {
  // Siempre parte con todos marcados; desmarcar es una decisión puntual de
  // este envío, no una preferencia que deba recordarse entre aperturas.
  const [seleccionados, setSeleccionados] = useState<Set<string>>(
    () => new Set(contactos.map((c) => c.id)),
  )
  const [query, setQuery] = useState('')
  const { copied, copy } = useCopy()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const filtrados = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return contactos
    return contactos.filter((c) => {
      const all = normalize([c.nombre, c.unidad, c.cargo].filter(Boolean).join(' '))
      return tokens.every((t) => all.includes(t))
    })
  }, [contactos, query])

  const toggle = (id: string) =>
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const marcarTodos = () => setSeleccionados(new Set(contactos.map((c) => c.id)))
  const desmarcarTodos = () => setSeleccionados(new Set())
  const marcarVisibles = () =>
    setSeleccionados((prev) => {
      const next = new Set(prev)
      for (const c of filtrados) next.add(c.id)
      return next
    })
  const desmarcarVisibles = () =>
    setSeleccionados((prev) => {
      const next = new Set(prev)
      for (const c of filtrados) next.delete(c.id)
      return next
    })

  const emailsSeleccionados = contactos.filter((c) => seleccionados.has(c.id)).map((c) => c.correo)
  const joined = emailsSeleccionados.join(', ')
  const todoFiltradoMarcado = filtrados.length > 0 && filtrados.every((c) => seleccionados.has(c.id))

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-in flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Funcionarios de la Corte
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {seleccionados.size} de {contactos.length} seleccionados
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              size={15}
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, unidad o cargo…"
              className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-500/10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <button type="button" onClick={marcarTodos} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Marcar todos ({contactos.length})
            </button>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <button type="button" onClick={desmarcarTodos} className="font-medium text-slate-500 hover:underline dark:text-slate-400">
              Desmarcar todos
            </button>
            {query.trim() && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <button
                  type="button"
                  onClick={todoFiltradoMarcado ? desmarcarVisibles : marcarVisibles}
                  className="font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                >
                  {todoFiltradoMarcado ? 'Desmarcar' : 'Marcar'} los {filtrados.length} resultados
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtrados.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
              No hay funcionarios que coincidan con "{query}".
            </p>
          ) : (
            <ul className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filtrados.map((c) => {
                const marcado = seleccionados.has(c.id)
                return (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => toggle(c.id)}
                        className="h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400 dark:border-slate-600"
                      />
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-opacity ${avatarPalette(c.id)} ${marcado ? '' : 'opacity-40'}`}
                      >
                        {initials(c.nombre)}
                      </div>
                      <div className={`min-w-0 flex-1 transition-opacity ${marcado ? '' : 'opacity-40'}`}>
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {c.nombre}
                        </p>
                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                          {[c.cargo, c.unidad].filter(Boolean).join(' · ')}
                        </p>
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
            Se enviará a los {seleccionados.size} funcionarios marcados.
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
                  ? 'pointer-events-none cursor-not-allowed bg-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Send size={15} />
              Enviar correo ({emailsSeleccionados.length})
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
