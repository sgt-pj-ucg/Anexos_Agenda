import { Search, X } from 'lucide-react'

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
        size={20}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="text"
        autoComplete="off"
        placeholder="Busca por nombre, cargo, tribunal, unidad, correo o anexo…"
        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pr-11 pl-12 text-base text-slate-900 shadow-sm transition-shadow outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          title="Limpiar búsqueda"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
