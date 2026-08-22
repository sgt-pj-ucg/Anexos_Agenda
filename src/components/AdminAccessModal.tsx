import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { IdCard, Lock, ShieldCheck, X } from 'lucide-react'
import { checkAdminLogin, setAdmin } from '../lib/auth'
import { formatRut } from '../lib/rut'

export function AdminAccessModal({ onClose }: { onClose: () => void }) {
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setChecking(true)
    try {
      const ok = await checkAdminLogin(rut, password)
      if (ok) {
        setAdmin(password)
        window.location.reload()
        return
      }
      setError(true)
      setPassword('')
    } finally {
      setChecking(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
              <ShieldCheck size={19} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Acceso administrador</h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Ingresa tu RUT y clave para poder editar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <IdCard
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={rut}
              onChange={(e) => {
                setRut(formatRut(e.target.value))
                setError(false)
              }}
              placeholder="RUT (ej. 12.345.678-9)"
              className={`w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm outline-none focus:ring-4 dark:bg-slate-900 dark:text-white ${
                error
                  ? 'border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-600 dark:focus:ring-indigo-500/10'
              }`}
            />
          </div>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Clave de acceso"
              className={`w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm outline-none focus:ring-4 dark:bg-slate-900 dark:text-white ${
                error
                  ? 'border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-600 dark:focus:ring-indigo-500/10'
              }`}
            />
          </div>
        </div>
        {error && (
          <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">RUT o clave incorrectos.</p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={checking || !rut || !password}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {checking ? 'Verificando…' : 'Ingresar'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
