import { Mail } from 'lucide-react'
import { CopyChip } from './CopyChip'

export function GeneralEmailBanner({ correo }: { correo: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 dark:border-indigo-900/40 dark:bg-indigo-500/5">
      <Mail size={16} className="shrink-0 text-indigo-500" />
      <span className="text-sm text-slate-600 dark:text-slate-300">Casilla general de la unidad:</span>
      <CopyChip value={correo} icon={<Mail size={12} />} href={`mailto:${correo}`} label="correo general" />
    </div>
  )
}
