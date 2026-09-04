import { useState } from 'react'
import { Bell, Flag, Lock, LogOut, Moon, Power, ShieldCheck, Sun } from 'lucide-react'
import { getAdminNombre, lock } from '../lib/auth'
import { cerrarAccesoGeneral } from '../lib/accessGate'
import { useIsAdmin } from '../context/RoleContext'
import { useVisitas } from '../hooks/useVisitas'
import { AdminAccessModal } from './AdminAccessModal'

export function Header({
  theme,
  onToggleTheme,
  totalPersonas,
  totalTribunales,
  novedadesCount,
  onOpenNovedades,
  reportesCount,
  onOpenReportes,
  usuariosActivos,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  totalPersonas: number
  totalTribunales: number
  novedadesCount: number
  onOpenNovedades: () => void
  reportesCount: number
  onOpenReportes: () => void
  usuariosActivos: number | null
}) {
  const isAdmin = useIsAdmin()
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const adminNombre = isAdmin ? getAdminNombre() : null
  const totalVisitas = useVisitas(isAdmin)

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 p-2 shadow-sm">
          <img
            src={`${import.meta.env.BASE_URL}escudo-poder-judicial.png`}
            alt="Escudo del Poder Judicial de Chile"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
              Directorio Jurisdiccional · La Serena
            </h1>
            {isAdmin && (
              <span className="flex min-w-0 shrink items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                <ShieldCheck size={11} className="shrink-0" />
                <span className="truncate">Admin{adminNombre ? ` · ${adminNombre}` : ''}</span>
              </span>
            )}
          </div>
          <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-300">
            Corte de Apelaciones de La Serena y tribunales de la IV Región de Coquimbo
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-4 text-right text-xs text-slate-500 md:flex dark:text-slate-300">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">{totalPersonas}</p>
            <p>contactos</p>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">{totalTribunales}</p>
            <p>tribunales</p>
          </div>
          {isAdmin && totalVisitas !== null && (
            <div title="Visitas: cada vez que alguien entró por el portón de acceso">
              <p className="flex items-center justify-end gap-1.5 text-base font-semibold text-slate-900 dark:text-white">
                {totalVisitas}
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </p>
              <p>visitas</p>
            </div>
          )}
          {isAdmin && usuariosActivos !== null && (
            <div title="Usuarios usando el directorio en este momento">
              <p className="flex items-center justify-end gap-1.5 text-base font-semibold text-slate-900 dark:text-white">
                {usuariosActivos}
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                </span>
              </p>
              <p>activos</p>
            </div>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={onOpenReportes}
            className="relative shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-900 dark:hover:text-rose-400"
            title="Ver reportes de datos incorrectos"
          >
            <Flag size={17} />
            {reportesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {reportesCount > 9 ? '9+' : reportesCount}
              </span>
            )}
          </button>
        )}
        <button
          onClick={onOpenNovedades}
          className="relative shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-900 dark:hover:text-indigo-400"
          title="Ver novedades del directorio"
        >
          <Bell size={17} />
          {novedadesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              {novedadesCount > 9 ? '9+' : novedadesCount}
            </span>
          )}
        </button>
        <button
          onClick={onToggleTheme}
          className="shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-900 dark:hover:text-indigo-400"
          title="Cambiar tema"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        {isAdmin ? (
          <button
            onClick={() => {
              lock()
              window.location.reload()
            }}
            className="shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-900 dark:hover:text-rose-400"
            title="Salir del modo administrador"
          >
            <LogOut size={17} />
          </button>
        ) : (
          <button
            onClick={() => setShowAdminLogin(true)}
            className="shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-900 dark:hover:text-indigo-400"
            title="Acceder como administrador"
          >
            <Lock size={17} />
          </button>
        )}
        <button
          onClick={() => {
            if (isAdmin) lock()
            cerrarAccesoGeneral()
            window.location.reload()
          }}
          className="shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-900 dark:hover:text-rose-400"
          title="Cerrar sesión"
        >
          <Power size={17} />
        </button>
      </div>

      {showAdminLogin && <AdminAccessModal onClose={() => setShowAdminLogin(false)} />}
    </header>
  )
}
