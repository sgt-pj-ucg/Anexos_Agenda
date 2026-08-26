import { useMemo, useState } from 'react'
import { Gavel, Mail, Pencil, UserCog, type LucideIcon } from 'lucide-react'
import type { FichaTribunal, Persona } from '../types'
import { COMUNA_ORDER, comunaRank } from '../lib/comunas'
import { MATERIA_ORDER } from '../lib/materias'
import { ComunaChips } from './ComunaChips'
import { MateriaChips } from './MateriaChips'
import { EmailCopyBanner } from './EmailCopyBanner'
import { CopyChip } from './CopyChip'
import { useIsAdmin } from '../context/RoleContext'

function uniqueEmails(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v))))
}

function CorreoSeleccionable({
  correo,
  icon: Icon,
  label,
  seleccionado,
  onToggle,
}: {
  correo: string
  icon: LucideIcon
  label: string
  seleccionado: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="checkbox"
        checked={seleccionado}
        onChange={onToggle}
        title="Seleccionar para armar un grupo de correo"
        className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400 dark:border-slate-600"
      />
      <CopyChip value={correo} icon={<Icon size={12} />} href={`mailto:${correo}`} label={label} />
    </div>
  )
}

export function TribunalContactosView({
  tribunales,
  personas,
  onEditFicha,
  correosSeleccionados,
  onToggleCorreo,
}: {
  tribunales: FichaTribunal[]
  personas: Persona[]
  onEditFicha: (ficha: FichaTribunal) => void
  correosSeleccionados?: Set<string>
  onToggleCorreo?: (correo: string) => void
}) {
  const isAdmin = useIsAdmin()
  const [comuna, setComuna] = useState<string | null>(null)
  const [materia, setMateria] = useState<string | null>(null)

  const nombrePorCorreo = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of personas) for (const correo of p.correos) if (!map.has(correo)) map.set(correo, p.nombre)
    return map
  }, [personas])

  const comunaCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tribunales) if (t.comuna) counts[t.comuna] = (counts[t.comuna] ?? 0) + 1
    return counts
  }, [tribunales])
  const comunasDisponibles = useMemo(
    () => COMUNA_ORDER.filter((c) => comunaCounts[c] > 0),
    [comunaCounts],
  )

  const materiaCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tribunales) {
      for (const c of t.competencias) counts[c] = (counts[c] ?? 0) + 1
    }
    return counts
  }, [tribunales])
  const materiasDisponibles = useMemo(
    () => MATERIA_ORDER.filter((m) => materiaCounts[m] > 0),
    [materiaCounts],
  )

  const filtered = useMemo(() => {
    let result = tribunales
    if (comuna) result = result.filter((t) => t.comuna === comuna)
    if (materia) result = result.filter((t) => t.competencias.includes(materia))
    return [...result].sort(
      (a, b) => comunaRank(a.comuna) - comunaRank(b.comuna) || a.nombre.localeCompare(b.nombre, 'es'),
    )
  }, [tribunales, comuna, materia])

  const genericos = useMemo(() => uniqueEmails(filtered.map((t) => t.correo)), [filtered])
  const adminSecretarios = useMemo(
    () => uniqueEmails(filtered.map((t) => t.correoAdminSecretario)),
    [filtered],
  )
  const segundosLideres = useMemo(
    () => uniqueEmails(filtered.map((t) => t.correoSegundoLider)),
    [filtered],
  )

  return (
    <div className="space-y-4">
      {comunasDisponibles.length > 1 && (
        <ComunaChips
          comunas={comunasDisponibles}
          active={comuna}
          onChange={setComuna}
          counts={comunaCounts}
        />
      )}

      {materiasDisponibles.length > 1 && (
        <MateriaChips
          materias={materiasDisponibles}
          active={materia}
          onChange={setMateria}
          counts={materiaCounts}
        />
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <EmailCopyBanner icon={Mail} label="Correos genéricos" correos={genericos} />
        <EmailCopyBanner icon={UserCog} label="Administrador / Secretario" correos={adminSecretarios} />
        <EmailCopyBanner icon={Gavel} label="Juez Presidente / Juez" correos={segundosLideres} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2.5 font-medium">Tribunal</th>
              <th className="px-3 py-2.5 font-medium">Correo genérico</th>
              <th className="px-3 py-2.5 font-medium">Administrador / Secretario</th>
              <th className="px-3 py-2.5 font-medium">Juez Presidente / Juez</th>
              {isAdmin && <th className="px-3 py-2.5 font-medium">Editar</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="bg-white transition-colors hover:bg-slate-50/70 dark:bg-slate-900 dark:hover:bg-slate-800/40"
              >
                <td className="px-3 py-2.5 align-top">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{t.nombre}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-400">
                    {[t.comuna, t.competencias.join(', ')].filter(Boolean).join(' · ')}
                  </p>
                </td>
                <td className="px-3 py-2.5 align-top">
                  {t.correo ? (
                    onToggleCorreo ? (
                      <CorreoSeleccionable
                        correo={t.correo}
                        icon={Mail}
                        label="correo genérico"
                        seleccionado={correosSeleccionados?.has(t.correo) ?? false}
                        onToggle={() => onToggleCorreo(t.correo!)}
                      />
                    ) : (
                      <CopyChip
                        value={t.correo}
                        icon={<Mail size={12} />}
                        href={`mailto:${t.correo}`}
                        label="correo genérico"
                      />
                    )
                  ) : (
                    <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top">
                  {t.correoAdminSecretario ? (
                    <>
                      {onToggleCorreo ? (
                        <CorreoSeleccionable
                          correo={t.correoAdminSecretario}
                          icon={UserCog}
                          label="correo administrador o secretario"
                          seleccionado={correosSeleccionados?.has(t.correoAdminSecretario) ?? false}
                          onToggle={() => onToggleCorreo(t.correoAdminSecretario!)}
                        />
                      ) : (
                        <CopyChip
                          value={t.correoAdminSecretario}
                          icon={<UserCog size={12} />}
                          href={`mailto:${t.correoAdminSecretario}`}
                          label="correo administrador o secretario"
                        />
                      )}
                      {nombrePorCorreo.get(t.correoAdminSecretario) && (
                        <p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-400">
                          {nombrePorCorreo.get(t.correoAdminSecretario)}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-xs italic text-slate-300 dark:text-slate-600">Sin asignar</span>
                  )}
                </td>
                <td className="px-3 py-2.5 align-top">
                  {t.correoSegundoLider ? (
                    <>
                      {onToggleCorreo ? (
                        <CorreoSeleccionable
                          correo={t.correoSegundoLider}
                          icon={Gavel}
                          label="correo del Juez Presidente o Juez"
                          seleccionado={correosSeleccionados?.has(t.correoSegundoLider) ?? false}
                          onToggle={() => onToggleCorreo(t.correoSegundoLider!)}
                        />
                      ) : (
                        <CopyChip
                          value={t.correoSegundoLider}
                          icon={<Gavel size={12} />}
                          href={`mailto:${t.correoSegundoLider}`}
                          label="correo del Juez Presidente o Juez"
                        />
                      )}
                      {nombrePorCorreo.get(t.correoSegundoLider) && (
                        <p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-400">
                          {nombrePorCorreo.get(t.correoSegundoLider)}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-xs italic text-slate-300 dark:text-slate-600">Sin asignar</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-3 py-2.5 align-top">
                    <button
                      type="button"
                      onClick={() => onEditFicha(t)}
                      title="Editar administrador/secretario y Juez Presidente / Juez"
                      className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <Pencil size={13} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
