import { useState, type FormEvent, type ReactNode } from 'react'
import { IdCard, Lock, ShieldCheck } from 'lucide-react'
import { checkAdminLogin, getRole, setAdmin } from '../lib/auth'
import { hayBienvenidaPendiente, claveAccesoGeneralValida, marcarBienvenidaMostrada, otorgarAccesoGeneral, tieneAccesoGeneral } from '../lib/accessGate'
import { formatRut } from '../lib/rut'
import { WelcomeScreen } from './WelcomeScreen'

// Portón de acceso: se muestra siempre, antes que cualquier otra cosa del
// sitio, hasta que se ingresa la clave general del público o las
// credenciales de administrador (las mismas que ya existían). Una vez
// adentro, la bienvenida aparece una sola vez para elegir por dónde empezar.
export function AccessGate({ children }: { children: ReactNode }) {
  const [pantalla, setPantalla] = useState<'porton' | 'bienvenida' | 'app'>(() => {
    if (tieneAccesoGeneral() || getRole() === 'admin') {
      return hayBienvenidaPendiente() ? 'bienvenida' : 'app'
    }
    return 'porton'
  })

  const [clave, setClave] = useState('')
  const [mostrarAdmin, setMostrarAdmin] = useState(false)
  const [rut, setRut] = useState('')
  const [passwordAdmin, setPasswordAdmin] = useState('')
  const [error, setError] = useState('')
  const [verificando, setVerificando] = useState(false)

  if (pantalla === 'bienvenida') {
    return (
      <WelcomeScreen
        onElegir={() => {
          marcarBienvenidaMostrada()
          setPantalla('app')
        }}
      />
    )
  }
  if (pantalla === 'app') {
    return <>{children}</>
  }

  const entrar = (e: FormEvent) => {
    e.preventDefault()
    if (claveAccesoGeneralValida(clave)) {
      otorgarAccesoGeneral()
      setPantalla('bienvenida')
    } else {
      setError('Clave incorrecta.')
      setClave('')
    }
  }

  const entrarComoAdmin = async (e: FormEvent) => {
    e.preventDefault()
    setVerificando(true)
    try {
      const nombre = await checkAdminLogin(rut, passwordAdmin)
      if (nombre) {
        setAdmin(passwordAdmin, nombre)
        otorgarAccesoGeneral()
        setPantalla('bienvenida')
      } else {
        setError('RUT o clave incorrectos.')
        setPasswordAdmin('')
      }
    } finally {
      setVerificando(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border py-3 pr-3 pl-10 text-sm text-white placeholder:text-slate-500 outline-none transition-colors bg-white/5 border-white/15 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_22%_15%,#1a2352,#060814_62%)] px-4 py-10">
      <form
        onSubmit={mostrarAdmin ? entrarComoAdmin : entrar}
        className="animate-fade-in w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-9 pt-10 text-center backdrop-blur-md"
      >
        <div className="relative mx-auto mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-3xl bg-gradient-to-br from-[#5850ec] to-[#2c2578] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-8px_16px_rgba(0,0,0,.22),0_0_0_1px_rgba(255,255,255,.08),0_20px_34px_-14px_rgba(79,70,229,.65)]">
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,.45),transparent_70%)] blur-[6px]" />
          <img
            src={`${import.meta.env.BASE_URL}escudo-poder-judicial.png`}
            alt="Escudo del Poder Judicial de Chile"
            className="h-full w-full object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,.4)]"
            style={{ filter: 'drop-shadow(0 0 18px rgba(165,180,252,.5))' }}
          />
        </div>
        <h1 className="mb-1 text-lg font-bold text-white">Directorio Jurisdiccional</h1>
        <p className="mb-7 text-xs text-indigo-100/70">
          Corte de Apelaciones de La Serena y tribunales de la IV Región de Coquimbo
        </p>

        {!mostrarAdmin ? (
          <div className="space-y-1 text-left">
            <label htmlFor="clave-acceso" className="mb-1.5 block text-[11.5px] font-semibold text-indigo-100/80">
              Clave de acceso
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="clave-acceso"
                type="password"
                autoFocus
                value={clave}
                onChange={(e) => {
                  setClave(e.target.value)
                  setError('')
                }}
                placeholder="Ingresa la clave"
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <div>
              <label htmlFor="rut-admin" className="mb-1.5 block text-[11.5px] font-semibold text-indigo-100/80">
                RUT
              </label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="rut-admin"
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={rut}
                  onChange={(e) => {
                    setRut(formatRut(e.target.value))
                    setError('')
                  }}
                  placeholder="12.345.678-9"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password-admin" className="mb-1.5 block text-[11.5px] font-semibold text-indigo-100/80">
                Clave de administrador
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="password-admin"
                  type="password"
                  value={passwordAdmin}
                  onChange={(e) => {
                    setPasswordAdmin(e.target.value)
                    setError('')
                  }}
                  placeholder="Tu clave personal"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={verificando || (mostrarAdmin ? !rut || !passwordAdmin : !clave)}
          className="mt-5 w-full rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-800 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(99,102,241,.6)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verificando ? 'Verificando…' : 'Entrar'}
        </button>

        <div className="mt-5 border-t border-dashed border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              setMostrarAdmin((v) => !v)
              setError('')
            }}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-100/70 hover:text-white"
          >
            <ShieldCheck size={13} className="text-amber-400" />
            {mostrarAdmin ? 'Volver a la clave general' : '¿Eres administrador? Ingresa con tu RUT'}
          </button>
        </div>
      </form>
    </div>
  )
}
