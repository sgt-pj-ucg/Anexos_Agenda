import { Check, Copy, Mail, type LucideIcon } from 'lucide-react'
import { buildGroupMailto } from '../lib/mailto'
import { useCopy } from '../hooks/useCopy'

export function EmailCopyBanner({
  icon: Icon,
  label,
  correos,
}: {
  icon: LucideIcon
  label: string
  correos: string[]
}) {
  const { copied, copy } = useCopy()
  const joined = correos.join(', ')

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-indigo-500" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
          {correos.length}
        </span>
      </div>
      {correos.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          <a
            href={buildGroupMailto(correos)}
            title={`Redactar correo a los ${correos.length} destinatarios`}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
          >
            <Mail size={12} /> Enviar correo
          </a>
          <button
            type="button"
            onClick={() => copy(joined)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied === joined ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            Copiar todos
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500">Sin correos disponibles con este filtro.</p>
      )}
    </div>
  )
}
