import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { checkPassword, getRole, setRole, type Role } from '../lib/auth'
import { RoleContext } from '../context/RoleContext'

export function PasswordGate({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null)
  const [checked, setChecked] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    setRoleState(getRole())
    setChecked(true)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setChecking(true)
    const matched = await checkPassword(value)
    setChecking(false)
    if (matched) {
      setRole(matched, value)
      setRoleState(matched)
    } else {
      setError(true)
      setValue('')
    }
  }

  if (!checked) return null
  if (role) return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 p-2.5">
            <img
              src={`${import.meta.env.BASE_URL}escudo-poder-judicial.png`}
              alt="Escudo del Poder Judicial de Chile"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Directorio Judicial · La Serena
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Acceso interno — ingresa la clave para continuar
          </p>
        </div>

        <div className="relative">
          <Lock
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(false)
            }}
            placeholder="Clave de acceso"
            className={`w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm outline-none focus:ring-4 dark:bg-slate-950 dark:text-white ${
              error
                ? 'border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-700 dark:focus:ring-indigo-500/10'
            }`}
          />
        </div>
        {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">Clave incorrecta.</p>}

        <button
          type="submit"
          disabled={checking || !value}
          className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {checking ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
