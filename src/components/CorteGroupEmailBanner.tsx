import { Check, Copy, Mail, type LucideIcon } from 'lucide-react'
import { buildGroupMailto } from '../lib/mailto'
import { useCopy } from '../hooks/useCopy'

const TONES = {
  violet: {
    wrap: 'border-violet-100 bg-violet-50/60 dark:border-violet-900/40 dark:bg-violet-500/5',
    icon: 'text-violet-600 dark:text-violet-400',
    btn: 'border-violet-300 bg-violet-100 text-violet-800 hover:bg-violet-200 dark:border-violet-800 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25',
    copyHover: 'hover:text-violet-600 dark:hover:text-violet-400',
  },
  amber: {
    wrap: 'border-amber-100 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-500/5',
    icon: 'text-amber-600 dark:text-amber-400',
    btn: 'border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200 dark:border-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25',
    copyHover: 'hover:text-amber-600 dark:hover:text-amber-400',
  },
} as const

export function CorteGroupEmailBanner({
  icon: Icon,
  label,
  sublabel,
  correos,
  tone,
}: {
  icon: LucideIcon
  label: string
  sublabel?: string
  correos: string[]
  tone: keyof typeof TONES
}) {
  const { copied, copy } = useCopy()
  if (correos.length === 0) return null
  const joined = correos.join(', ')
  const t = TONES[tone]

  return (
    <div className={`mb-4 flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3 ${t.wrap}`}>
      <Icon size={16} className={`shrink-0 ${t.icon}`} />
      <span className="text-sm text-slate-600 dark:text-slate-200">
        {label}
        {sublabel && <span className="text-xs text-slate-400 dark:text-slate-500"> ({sublabel})</span>}:
      </span>
      <a
        href={buildGroupMailto(correos)}
        title={`Redactar correo a los ${correos.length} destinatarios de este grupo (en copia oculta)`}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${t.btn}`}
      >
        <Mail size={12} />
        Enviar correo a todos ({correos.length})
      </a>
      <button
        type="button"
        onClick={() => copy(joined)}
        title="Copiar todas las direcciones (respaldo si Outlook no separa los destinatarios)"
        className={`rounded-full border border-slate-200 p-1.5 text-slate-400 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-700 ${t.copyHover}`}
      >
        {copied === joined ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      </button>
    </div>
  )
}
