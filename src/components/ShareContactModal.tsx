import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Download, Mail, Phone, Share2, X } from 'lucide-react'
import type { Persona } from '../types'
import { avatarPalette, initials } from '../lib/format'
import { contactoTexto, descargarVCard } from '../lib/vcard'
import { useCopy } from '../hooks/useCopy'

export function ShareContactModal({ p, onClose }: { p: Persona; onClose: () => void }) {
  const { copied, copy } = useCopy()
  const texto = contactoTexto(p)
  const puedeCompartirNativo = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const compartirNativo = async () => {
    try {
      await navigator.share({ title: p.nombre, text: texto })
    } catch {
      // El usuario canceló el panel de compartir del sistema: no hay nada que hacer.
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-in w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarPalette(p.id)}`}
            >
              {initials(p.nombre)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-bold text-slate-900 dark:text-white">{p.nombre}</h2>
              {p.cargo && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{p.cargo}</p>}
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

        {(p.correos.length > 0 || p.anexo) && (
          <div className="space-y-1.5 p-5">
            {p.correos.map((correo) => (
              <p key={correo} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Mail size={14} className="shrink-0 text-slate-400" /> {correo}
              </p>
            ))}
            {p.anexo && (
              <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Phone size={14} className="shrink-0 text-slate-400" /> Anexo {p.anexo}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2 border-t border-slate-100 p-4 dark:border-slate-800">
          {puedeCompartirNativo && (
            <button
              type="button"
              onClick={compartirNativo}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Share2 size={15} /> Compartir…
            </button>
          )}
          <button
            type="button"
            onClick={() => descargarVCard(p)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download size={15} /> Descargar tarjeta de contacto (.vcf)
          </button>
          <button
            type="button"
            onClick={() => copy(texto)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied === texto ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            Copiar datos de contacto
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
