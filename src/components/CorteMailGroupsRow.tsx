import { Check, Copy, Send, type LucideIcon } from 'lucide-react'
import { buildGroupMailto } from '../lib/mailto'
import { useCopy } from '../hooks/useCopy'

const TONES = {
  violet:
    'border-violet-200 text-violet-800 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-500/10',
  indigo:
    'border-indigo-200 text-indigo-800 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-500/10',
  rose: 'border-rose-200 text-rose-800 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-500/10',
  sky: 'border-sky-200 text-sky-800 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-500/10',
  amber:
    'border-amber-200 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-500/10',
} as const

export interface CorteMailGroup {
  id: string
  icon: LucideIcon
  label: string
  correos: string[]
  tone: keyof typeof TONES
}

function Chip({ icon: Icon, label, correos, tone }: CorteMailGroup) {
  const { copied, copy } = useCopy()
  if (correos.length === 0) return null
  const joined = correos.join(', ')

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full border bg-white pr-1 dark:bg-slate-800 ${TONES[tone]}`}>
      <a
        href={buildGroupMailto(correos)}
        title={`Redactar correo a los ${correos.length} destinatarios de este grupo (en copia oculta)`}
        className="flex items-center gap-1.5 rounded-full py-1.5 pl-2.5 text-xs font-semibold"
      >
        <Icon size={13} />
        {label}
        <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">{correos.length}</span>
      </a>
      <button
        type="button"
        onClick={() => copy(joined)}
        title="Copiar todas las direcciones (respaldo si Outlook no separa los destinatarios)"
        className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        {copied === joined ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      </button>
    </span>
  )
}

export function CorteMailGroupsRow({ groups, todos }: { groups: CorteMailGroup[]; todos: string[] }) {
  const visibles = groups.filter((g) => g.correos.length > 0)
  if (visibles.length === 0 && todos.length === 0) return null
  const { copied, copy } = useCopy()
  const joined = todos.join(', ')

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/40">
      <span className="mr-0.5 shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">
        Enviar correo a:
      </span>
      {visibles.map((g) => (
        <Chip key={g.id} {...g} />
      ))}
      {todos.length > 0 && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 pr-1 text-white">
          <a
            href={buildGroupMailto(todos)}
            title={`Redactar correo a los ${todos.length} funcionarios de toda la Corte (en copia oculta)`}
            className="flex items-center gap-1.5 rounded-full py-1.5 pl-2.5 text-xs font-semibold"
          >
            <Send size={13} />
            Todos los funcionarios de la Corte
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{todos.length}</span>
          </a>
          <button
            type="button"
            onClick={() => copy(joined)}
            title="Copiar todas las direcciones (respaldo si Outlook no separa los destinatarios)"
            className="rounded-full p-1 text-white/80 hover:text-white"
          >
            {copied === joined ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </span>
      )}
    </div>
  )
}
