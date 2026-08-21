import { Check, Copy, Mail, Users } from 'lucide-react'
import { buildGroupMailto } from '../lib/mailto'
import { useCopy } from '../hooks/useCopy'

export function FuncionariosCorteEmailBanner({ correos }: { correos: string[] }) {
  const { copied, copy } = useCopy()
  if (correos.length === 0) return null
  const joined = correos.join(', ')

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3 dark:border-violet-900/40 dark:bg-violet-500/5">
      <Users size={16} className="shrink-0 text-violet-600 dark:text-violet-400" />
      <span className="text-sm text-slate-600 dark:text-slate-200">
        Funcionarios de la Corte{' '}
        <span className="text-xs text-slate-400 dark:text-slate-500">
          (sin ministros, relatores, fiscalías ni casillas generales)
        </span>
        :
      </span>
      <a
        href={buildGroupMailto(correos)}
        title={`Redactar correo a los ${correos.length} funcionarios (en copia oculta)`}
        className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 transition-colors hover:bg-violet-200 dark:border-violet-800 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25"
      >
        <Mail size={12} />
        Enviar correo a todos ({correos.length})
      </a>
      <button
        type="button"
        onClick={() => copy(joined)}
        title="Copiar todas las direcciones (respaldo si Outlook no separa los destinatarios)"
        className="rounded-full border border-slate-200 p-1.5 text-slate-400 hover:bg-white hover:text-violet-600 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-violet-400"
      >
        {copied === joined ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      </button>
    </div>
  )
}
