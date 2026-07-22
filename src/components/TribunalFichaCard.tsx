import {
  ChevronDown,
  ChevronRight,
  Flag,
  Landmark,
  Mail,
  Pencil,
  Phone,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import type { FichaTribunal, Persona } from '../types'
import { CopyChip } from './CopyChip'
import { GroupEmailButton } from './GroupEmailButton'
import { useIsAdmin } from '../context/RoleContext'

interface Props {
  ficha: FichaTribunal
  people: Persona[]
  collapsed: boolean
  onToggleCollapse: () => void
  onEdit?: () => void
  onReport?: () => void
  onAddPerson?: () => void
}

export function TribunalFichaCard({
  ficha,
  people,
  collapsed,
  onToggleCollapse,
  onEdit,
  onReport,
  onAddPerson,
}: Props) {
  const isAdmin = useIsAdmin()

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-500/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Landmark size={16} className="shrink-0 text-indigo-500" />
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
          {onReport && (
            <button
              type="button"
              onClick={onReport}
              title="Reportar dato incorrecto de este tribunal"
              className="rounded-full border border-white bg-white p-1.5 text-slate-400 hover:border-rose-300 hover:text-rose-600 dark:border-slate-900 dark:bg-slate-900 dark:text-slate-500"
            >
              <Flag size={12} />
            </button>
          )}
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

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-indigo-100 pt-3 dark:border-indigo-900/40">
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Mostrar personal' : 'Ocultar personal'}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
            collapsed
              ? 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-500/10'
              : 'border-indigo-200 bg-white dark:border-indigo-900/50 dark:bg-slate-900'
          }`}
        >
          {collapsed ? (
            <ChevronRight size={15} className="shrink-0 text-indigo-500" />
          ) : (
            <ChevronDown size={15} className="shrink-0 text-indigo-500" />
          )}
          <span className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Users size={11} /> {people.length}
          </span>
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {collapsed ? 'Ver funcionarios' : 'Ocultar'}
          </span>
        </button>
        <GroupEmailButton people={people} />
        {isAdmin && onAddPerson && (
          <button
            type="button"
            onClick={onAddPerson}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
          >
            <UserPlus size={12} />
            Agregar contacto
          </button>
        )}
      </div>
    </div>
  )
}
