import { Check, Copy, Mail } from 'lucide-react'
import type { Persona } from '../types'
import { buildGroupMailto, collectGroupEmails } from '../lib/mailto'
import { useCopy } from '../hooks/useCopy'

export function GroupEmailButton({ people }: { people: Persona[] }) {
  const emails = collectGroupEmails(people)
  const { copied, copy } = useCopy()

  if (emails.length === 0) return null

  const joined = emails.join(', ')

  return (
    <span className="inline-flex items-center gap-1">
      <a
        href={buildGroupMailto(emails)}
        title={`Redactar correo a los ${emails.length} destinatarios de este grupo (en copia oculta)`}
        className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
      >
        <Mail size={12} />
        Enviar correo a todos ({emails.length})
      </a>
      <button
        type="button"
        onClick={() => copy(joined)}
        title="Copiar todas las direcciones (respaldo si Outlook no separa los destinatarios)"
        className="rounded-full border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
      >
        {copied === joined ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      </button>
    </span>
  )
}
