import { Check, Copy, Mail } from 'lucide-react'
import { buildGroupMailto } from '../lib/mailto'
import { useCopy } from '../hooks/useCopy'

export function TribunalesEmailBanner({ suffix, correos }: { suffix: string; correos: string[] }) {
  const { copied, copy } = useCopy()
  if (correos.length === 0) return null
  const joined = correos.join(', ')
  const cantidad = correos.length === 1 ? '1 tribunal' : `los ${correos.length} tribunales`

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-500/5">
      <Mail size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Casillas generales de {cantidad}
        {suffix && (
          <>
            {' '}
            (<strong className="font-medium text-slate-800 dark:text-slate-100">{suffix}</strong>)
          </>
        )}
        :
      </span>
      <a
        href={buildGroupMailto(correos)}
        title={`Redactar correo a ${cantidad} (en copia oculta)`}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-200 dark:border-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25"
      >
        <Mail size={12} />
        Enviar correo a todos ({correos.length})
      </a>
      <button
        type="button"
        onClick={() => copy(joined)}
        title="Copiar todas las direcciones (respaldo si Outlook no separa los destinatarios)"
        className="rounded-full border border-slate-200 p-1.5 text-slate-400 hover:bg-white hover:text-amber-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-amber-400"
      >
        {copied === joined ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      </button>
    </div>
  )
}
