import { Landmark, Mail, Pencil, Phone, User } from 'lucide-react'
import type { FichaTribunal } from '../types'
import { CopyChip } from './CopyChip'
import { useIsAdmin } from '../context/RoleContext'

export function TribunalFichaCard({
  ficha,
  onEdit,
}: {
  ficha: FichaTribunal
  onEdit?: () => void
}) {
  const isAdmin = useIsAdmin()

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-500/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Landmark size={16} className="text-indigo-500" />
          <p className="font-semibold text-slate-900 dark:text-white">{ficha.nombre}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
            <User size={12} /> Ministro(a) visitador(a):{' '}
            {ficha.ministroVisitador ? (
              <strong className="font-medium text-slate-800 dark:text-slate-100">
                {ficha.ministroVisitador}
              </strong>
            ) : (
              <span className="text-slate-400 italic dark:text-slate-500">sin asignar</span>
            )}
          </span>
          {isAdmin && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Editar ficha del tribunal (ministro visitador, correo, teléfono, competencias)"
              className="rounded-full border border-indigo-200 bg-white p-1.5 text-indigo-500 hover:border-indigo-400 hover:text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-400"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {ficha.correo && (
          <CopyChip
            value={ficha.correo}
            icon={<Mail size={12} />}
            href={`mailto:${ficha.correo}`}
            label="correo general"
          />
        )}
        {ficha.telefono && <CopyChip value={ficha.telefono} icon={<Phone size={12} />} label="teléfono" />}
        {ficha.competencias.map((c) => (
          <span
            key={c}
            className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}
