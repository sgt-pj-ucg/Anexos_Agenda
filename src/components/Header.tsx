import { Moon, Scale, Sun } from 'lucide-react'

export function Header({
  theme,
  onToggleTheme,
  totalPersonas,
  totalTribunales,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  totalPersonas: number
  totalTribunales: number
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <Scale size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
            Directorio Judicial · La Serena
          </h1>
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
        <button
          onClick={onToggleTheme}
          className="shrink-0 rounded-full border border-slate-200 p-2.5 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-indigo-900 dark:hover:text-indigo-400"
          title="Cambiar tema"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  )
}
