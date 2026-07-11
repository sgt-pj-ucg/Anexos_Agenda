import { ArrowUpRight, Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCopy } from '../hooks/useCopy'

interface Props {
  value: string
  display?: string
  href?: string
  icon: ReactNode
  label: string
}

export function CopyChip({ value, display, href, icon, label }: Props) {
  const { copied, copy } = useCopy()
  const isCopied = copied === value

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-1.5 text-xs text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-500/10">
      <button
        type="button"
        onClick={() => copy(value)}
        className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200"
        title={`Copiar ${label}`}
      >
        {isCopied ? <Check size={13} className="text-emerald-500" /> : icon}
        <span className="max-w-[11rem] truncate">{display ?? value}</span>
      </button>
      {href && (
        <a
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
          title={`Abrir ${label}`}
        >
          <ArrowUpRight size={12} />
        </a>
      )}
    </span>
  )
}
