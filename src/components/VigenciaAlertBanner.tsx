import { useMemo, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { ContactoExterno, Persona } from '../types'
import { esPrimerDiaVencido, formatFecha } from '../lib/vigencia'
import { alertaVigenciaDescartadaHoy, descartarAlertaVigenciaHoy } from '../lib/vigenciaAlerta'
import { useIsAdmin } from '../context/RoleContext'

export function VigenciaAlertBanner({
  people,
  contactosExternos,
}: {
  people: Persona[]
  contactosExternos: ContactoExterno[]
}) {
  const isAdmin = useIsAdmin()
  const [dismissed, setDismissed] = useState(() => alertaVigenciaDescartadaHoy())

  const vencidosAyer = useMemo(() => {
    const personas = people
      .filter((p) => esPrimerDiaVencido(p.vigenciaHasta))
      .map((p) => ({ id: `p-${p.id}`, nombre: p.nombre, contexto: p.unidad, hasta: p.vigenciaHasta! }))
    const externos = contactosExternos
      .filter((c) => esPrimerDiaVencido(c.vigenciaHasta))
      .map((c) => ({
        id: `c-${c.id}`,
        nombre: c.nombre ?? c.institucion ?? 'Contacto externo',
        contexto: c.institucion ?? '',
        hasta: c.vigenciaHasta!,
      }))
    return [...personas, ...externos]
  }, [people, contactosExternos])

  if (!isAdmin || dismissed || vencidosAyer.length === 0) return null

  const handleDismiss = () => {
    descartarAlertaVigenciaHoy()
    setDismissed(true)
  }

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-orange-300 bg-orange-50 px-4 py-3 dark:border-orange-500/40 dark:bg-orange-500/10">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-orange-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
          {vencidosAyer.length === 1
            ? 'Un período de cargo transitorio venció ayer'
            : `${vencidosAyer.length} períodos de cargos transitorios vencieron ayer`}
        </p>
        <p className="mt-0.5 text-xs text-orange-700/80 dark:text-orange-300/70">
          Revisa si corresponde actualizar la vigencia o dejar el cargo vacante:
        </p>
        <ul className="mt-1.5 space-y-0.5 text-xs text-orange-800 dark:text-orange-300">
          {vencidosAyer.map((v) => (
            <li key={v.id}>
              <span className="font-medium">{v.nombre}</span>
              {v.contexto && (
                <span className="text-orange-700/70 dark:text-orange-400/70"> · {v.contexto}</span>
              )}
              <span className="text-orange-700/70 dark:text-orange-400/70">
                {' '}
                · venció el {formatFecha(v.hasta)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        title="Descartar por hoy"
        className="shrink-0 rounded-full p-1 text-orange-400 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-500/20"
      >
        <X size={16} />
      </button>
    </div>
  )
}
