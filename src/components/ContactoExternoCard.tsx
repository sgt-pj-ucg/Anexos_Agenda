import { useState } from 'react'
import { Flag, Info, Mail, MapPin, Pencil, Phone, Trash2 } from 'lucide-react'
import type { ContactoExterno } from '../types'
import { CopyChip } from './CopyChip'
import { useIsAdmin } from '../context/RoleContext'

export function ContactoExternoCard({
  contacto,
  subLabel,
  onEdit,
  onDelete,
  onReport,
}: {
  contacto: ContactoExterno
  subLabel?: string
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
}) {
  const isAdmin = useIsAdmin()
  const [showObs, setShowObs] = useState(false)
  const esVacante = contacto.nombre?.toUpperCase().includes('VACANTE')

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {subLabel && (
            <p className="text-[11px] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
              {subLabel}
            </p>
          )}
          <p className={`font-medium ${esVacante ? 'text-slate-400 italic dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
            {contacto.nombre ?? 'Sin nombre'}
          </p>
          {contacto.cargo && <p className="text-xs text-slate-500 dark:text-slate-400">{contacto.cargo}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {contacto.calidadJuridica && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {contacto.calidadJuridica}
            </span>
          )}
          {onReport && (
            <button
              type="button"
              onClick={onReport}
              title="Reportar dato incorrecto"
              className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            >
              <Flag size={13} />
            </button>
          )}
          {isAdmin && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Editar contacto"
              className="rounded-full p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
            >
              <Pencil size={13} />
            </button>
          )}
          {isAdmin && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Eliminar contacto"
              className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {(contacto.correos.length > 0 || contacto.telefonos.length > 0 || contacto.direccion) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {contacto.correos.map((correo) => (
            <CopyChip
              key={correo}
              value={correo}
              icon={<Mail size={12} />}
              href={`mailto:${correo}`}
              label="correo"
              wide
            />
          ))}
          {contacto.telefonos.map((tel) => (
            <CopyChip key={tel} value={tel} icon={<Phone size={12} />} href={`tel:${tel}`} label="teléfono" wide />
          ))}
          {contacto.direccion && (
            <CopyChip
              value={contacto.direccion}
              icon={<MapPin size={12} />}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contacto.direccion)}`}
              label="dirección"
              wide
            />
          )}
        </div>
      )}

      {contacto.observaciones && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowObs((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400"
          >
            <Info size={11} /> {showObs ? 'Ocultar nota' : 'Ver nota'}
          </button>
          {showObs && (
            <p className="mt-1 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {contacto.observaciones}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
