import { Download, LogOut, Moon, RotateCcw, ShieldCheck, Sun } from 'lucide-react'
import { lock } from '../lib/auth'
import { useIsAdmin } from '../context/RoleContext'

export function Header({
  theme,
  onToggleTheme,
  totalPersonas,
  totalTribunales,
  hasChanges,
  onExport,
  onReset,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  totalPersonas: number
  totalTribunales: number
  hasChanges: boolean
  onExport: () => void
  onReset: () => void
}) {
  const isAdmin = useIsAdmin()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
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
              Directorio Judicial · La Serena
            </h1>
            {isAdmin && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                <ShieldCheck size={11} /> Admin
              </span>
            )}
          </div>
          <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">
            Corte de Apelaciones de La Serena y tribunales de la IV Región de Coquimbo
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-4 text-right text-xs text-slate-500 md:flex dark:text-slate-400">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">{totalPersonas}</p>
            <p>contactos</p>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">{totalTribunales}</p>
            <p>tribunales</p>
          </div>
        </div>
        {isAdmin && hasChanges && (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={onExport}
              title="Descargar directorio.json con tus cambios para subirlo a GitHub"
              className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-600"
            >
              <Download size={14} />
              Exportar cambios
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Descartar todos los cambios sin exportar?')) onReset()
              }}
              title="Descartar todos los cambios locales"
              className="rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-rose-200 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:text-rose-400"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        )}
        <button
          onClick={onToggleTheme}
          className="shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-indigo-900 dark:hover:text-indigo-400"
          title="Cambiar tema"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          onClick={() => {
            lock()
            window.location.reload()
          }}
          className="shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-rose-200 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:text-rose-400"
          title="Cerrar sesión (útil en computadores compartidos)"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
