import { Cake, Mail, Pencil, Phone, Trash2 } from 'lucide-react'
import type { Persona } from '../types'
import { anexoDigits, avatarPalette, initials } from '../lib/format'
import { isToday, parseCumple } from '../lib/cumpleanos'
import { CopyChip } from './CopyChip'
import { useIsAdmin } from '../context/RoleContext'

interface Props {
  p: Persona
  contextTag?: string
  onEdit?: () => void
  onDelete?: () => void
}

export function PersonCard({ p, contextTag, onEdit, onDelete }: Props) {
  const isAdmin = useIsAdmin()
  const cumpleHoy = isToday(p.cumpleanos)
  const cumpleParsed = parseCumple(p.cumpleanos)

  const adminControls = isAdmin && (onEdit || onDelete) && (
    <div className="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          title="Editar contacto"
          className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        >
          <Pencil size={13} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          title="Eliminar contacto"
          className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  )

  if (p.vacante) {
    return (
      <div className="relative rounded-2xl border border-dashed border-rose-300 bg-rose-50/50 p-4 dark:border-rose-900 dark:bg-rose-500/5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-rose-700 dark:text-rose-300">Cargo vacante</p>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
            Sin titular
          </span>
        </div>
        {p.cargo && (
          <p className="mt-1 text-sm text-rose-600/80 dark:text-rose-300/70">{p.cargo}</p>
        )}
        {contextTag && <p className="mt-1 text-xs text-rose-500/70 dark:text-rose-400/60">{contextTag}</p>}
        {p.anexo && (
          <div className="mt-3">
            <CopyChip
              value={p.anexo}
              icon={<Phone size={12} />}
              href={anexoDigits(p.anexo) ? `tel:${anexoDigits(p.anexo)}` : undefined}
              label="anexo"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {adminControls}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarPalette(p.id)}`}
        >
          {p.esGenerico ? <Mail size={17} /> : initials(p.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">{p.nombre}</p>
          {(p.cargo || p.calidadJuridica) && (
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {[p.cargo, p.calidadJuridica].filter(Boolean).join(' · ')}
            </p>
          )}
          {contextTag && (
            <p className="mt-0.5 truncate text-xs text-indigo-600/80 dark:text-indigo-400/80">{contextTag}</p>
          )}
          {p.suplente && (
            <p className="mt-0.5 truncate text-xs text-amber-600 dark:text-amber-400">
              Suplente: {p.suplente}
            </p>
          )}
        </div>
        {cumpleHoy && (
          <span
            title={`Cumpleaños hoy: ${p.cumpleanos}`}
            className="shrink-0 rounded-full bg-amber-100 p-1.5 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          >
            <Cake size={14} />
          </span>
        )}
      </div>

      {(p.correos.length > 0 || p.anexo) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.correos.map((correo) => (
            <CopyChip
              key={correo}
              value={correo}
              icon={<Mail size={12} />}
              href={`mailto:${correo}`}
              label="correo"
            />
          ))}
          {p.anexo && (
            <CopyChip
              value={p.anexo}
              icon={<Phone size={12} />}
              href={anexoDigits(p.anexo) ? `tel:${anexoDigits(p.anexo)}` : undefined}
              label="anexo"
            />
          )}
        </div>
      )}

      {!cumpleHoy && cumpleParsed && (
        <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-600">🎂 {p.cumpleanos}</p>
      )}
    </div>
  )
}
