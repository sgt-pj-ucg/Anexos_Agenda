import { useState } from 'react'
import { Cake, CalendarX, Flag, Mail, Pencil, Phone, Route, Share2, Star, Trash2 } from 'lucide-react'
import type { Persona } from '../types'
import { anexoDigits, avatarPalette, initials } from '../lib/format'
import { isToday, parseCumple } from '../lib/cumpleanos'
import { esVigenciaFutura, esVigenciaVencida, formatFecha } from '../lib/vigencia'
import { ausenteTipoLabel } from '../lib/ausentismo'
import { CopyChip } from './CopyChip'
import { ShareContactModal } from './ShareContactModal'
import { useIsAdmin } from '../context/RoleContext'

interface Props {
  p: Persona
  contextTag?: string
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
  onCargoTransitorio?: () => void
  onAusentismo?: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function PersonCard({
  p,
  contextTag,
  onEdit,
  onDelete,
  onReport,
  onCargoTransitorio,
  onAusentismo,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const isAdmin = useIsAdmin()
  const [shareOpen, setShareOpen] = useState(false)
  const cumpleHoy = isToday(p.cumpleanos)
  const cumpleParsed = parseCumple(p.cumpleanos)
  const vigenciaVencida = esVigenciaVencida(p.vigenciaHasta)
  // Si esto llega a renderizarse es porque quien mira es administrador: a
  // los demás usuarios useDirectorioData ya les oculta por completo estos
  // cargos "programados" hasta que empiece su período.
  const vigenciaFutura = esVigenciaFutura(p.vigenciaDesde)
  // Puesto por aplicarCargoTransitorio()/aplicarAusentismo() en el hook de
  // datos mientras corresponde; p.origenTribunal es a dónde vuelve sola al
  // vencer p.transitorioHasta.
  const enComision = p.enComision === true
  const ausente = p.ausente === true

  const cornerControls = (
    <div className="absolute top-3 right-3 flex items-center gap-1">
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {onReport && (
          <button
            type="button"
            onClick={onReport}
            title="Reportar dato incorrecto"
            className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-rose-300 hover:text-rose-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <Flag size={13} />
          </button>
        )}
        {isAdmin && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            title="Editar contacto"
            className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <Pencil size={13} />
          </button>
        )}
        {isAdmin && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Eliminar contacto"
            className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-rose-300 hover:text-rose-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <Trash2 size={13} />
          </button>
        )}
        {isAdmin && onCargoTransitorio && (
          <button
            type="button"
            onClick={onCargoTransitorio}
            title="Cargo Transitorio"
            className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-sky-300 hover:text-sky-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <Route size={13} />
          </button>
        )}
        {isAdmin && onAusentismo && (
          <button
            type="button"
            onClick={onAusentismo}
            title="Ausentismo"
            className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-violet-300 hover:text-violet-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <CalendarX size={13} />
          </button>
        )}
      </div>
      {/* Solo en el celular: en el PC no existe el panel nativo "Compartir"
          (WhatsApp, etc.) y los datos se copian mejor con los chips de abajo. */}
      <button
        type="button"
        onClick={() => setShareOpen(true)}
        title="Compartir contacto"
        className="rounded-full p-1.5 text-slate-300 hover:text-indigo-500 md:hidden dark:text-slate-500 dark:hover:text-indigo-400"
      >
        <Share2 size={15} />
      </button>
      {onToggleFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          title={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          className="rounded-full p-1.5 text-slate-300 hover:text-amber-400 dark:text-slate-500"
        >
          <Star size={15} className={isFavorite ? 'fill-amber-400 text-amber-500' : ''} />
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
        {isAdmin && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="mt-3 flex items-center gap-1.5 rounded-full border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            <Pencil size={12} />
            Incorporar funcionario
          </button>
        )}
      </div>
    )
  }

  return (
    <>
    <div
      className={`group relative rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        vigenciaVencida
          ? 'border-orange-400 bg-orange-50/40 dark:border-orange-500/60 dark:bg-orange-500/5'
          : ausente
            ? 'border-violet-400 bg-violet-50/40 dark:border-violet-500/60 dark:bg-violet-500/5'
            : enComision
              ? 'border-sky-400 bg-sky-50/40 dark:border-sky-500/60 dark:bg-sky-500/5'
              : vigenciaFutura
                ? 'border-emerald-400 bg-slate-200 dark:border-emerald-500/60 dark:bg-slate-900/80'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
      }`}
    >
      {cornerControls}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarPalette(p.id)}`}
        >
          {p.esGenerico ? <Mail size={17} /> : initials(p.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">{p.nombre}</p>
          {(p.cargo || p.calidadJuridica) && (
            <p className="truncate text-sm text-slate-500 dark:text-slate-300">
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
          {vigenciaVencida && p.vigenciaHasta && (
            <p className="mt-0.5 truncate text-xs font-medium text-orange-600 dark:text-orange-400">
              Vigencia vencida el {formatFecha(p.vigenciaHasta)}
            </p>
          )}
          {vigenciaFutura && p.vigenciaDesde && (
            <p className="mt-0.5 truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Vigente desde el {formatFecha(p.vigenciaDesde)} · solo visible para Admin
            </p>
          )}
          {enComision && (
            <p className="mt-0.5 truncate text-xs font-medium text-sky-600 dark:text-sky-400">
              Cargo transitorio{p.origenTribunal && <> · titular en {p.origenTribunal}</>}
              {p.transitorioHasta && <> · vuelve el {formatFecha(p.transitorioHasta)}</>}
            </p>
          )}
          {ausente && (
            <p className="mt-0.5 truncate text-xs font-medium text-violet-600 dark:text-violet-400">
              Ausente: {ausenteTipoLabel(p.ausenteTipo, p.ausenteMotivo)}
              {p.ausenteHasta && <> · vuelve el {formatFecha(p.ausenteHasta)}</>}
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
        <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">🎂 {p.cumpleanos}</p>
      )}
    </div>
    {shareOpen && <ShareContactModal p={p} onClose={() => setShareOpen(false)} />}
    </>
  )
}
