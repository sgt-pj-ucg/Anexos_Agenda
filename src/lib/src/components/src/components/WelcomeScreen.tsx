import { SECTION_META, SECTION_ORDER } from '../lib/sections'
import { CATEGORIA_META, CATEGORIA_ORDER } from '../lib/contactosExternos'
import { elegirDestinoInicial } from '../lib/accessGate'

// Aparece una sola vez, justo después de entrar al portón (ver AccessGate),
// para elegir por dónde empezar en vez de caer siempre en "Todos los
// contactos". Reutiliza los mismos íconos y descripciones que ya se usan en
// las pestañas de secciones y en la vista de contactos externos, para no
// duplicar contenido ni arriesgar que queden desalineados con el resto.
export function WelcomeScreen({ onElegir }: { onElegir: () => void }) {
  const secciones = SECTION_ORDER.filter((s) => s !== 'todos').map((s) => SECTION_META[s])

  const irASeccion = (seccion: string) => {
    elegirDestinoInicial({ section: seccion })
    onElegir()
  }

  const irAExterno = (categoria: string) => {
    elegirDestinoInicial({ externo: true, categoriaExterna: categoria })
    onElegir()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[radial-gradient(circle_at_22%_15%,#1a2352,#060814_62%)] px-6 py-12">
      <div className="relative mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5850ec] to-[#2c2578] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_12px_rgba(0,0,0,.22),0_0_0_1px_rgba(255,255,255,.08)]">
        <div className="pointer-events-none absolute -inset-5 -z-10 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,.4),transparent_70%)] blur-[5px]" />
        <img
          src={`${import.meta.env.BASE_URL}escudo-poder-judicial.png`}
          alt="Escudo del Poder Judicial de Chile"
          className="h-full w-full object-contain"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.4)) drop-shadow(0 0 14px rgba(165,180,252,.45))' }}
        />
      </div>
      <h1 className="mb-1 text-center text-2xl font-bold text-white">Bienvenido al Directorio</h1>
      <p className="mb-8 text-center text-xs tracking-wide text-indigo-100/70">¿Con qué quieres empezar?</p>

      <div className="w-full max-w-[980px]">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">Secciones principales</span>
          <div className="h-px flex-1 bg-white/[0.07]" />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {secciones.map((s, i) => {
            const Icon = s.icon
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => irASeccion(s.key)}
                style={{ animationDelay: `${0.22 + i * 0.05}s` }}
                className="animate-sube-entra group flex flex-col items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left opacity-0 transition-all hover:-translate-y-1 hover:border-indigo-400 hover:bg-white/[0.075]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-500/20 text-indigo-300">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold text-white">{s.short}</span>
                <span className="text-[11.5px] leading-snug text-indigo-100/60">{s.description}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 mb-3.5 flex items-center gap-2.5">
          <span className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">Contactos externos</span>
          <div className="h-px flex-1 bg-white/[0.07]" />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIA_ORDER.map((key, i) => {
            const c = CATEGORIA_META[key]
            const Icon = c.icon
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => irAExterno(c.key)}
                style={{ animationDelay: `${0.5 + i * 0.05}s` }}
                className="animate-sube-entra group flex flex-col items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left opacity-0 transition-all hover:-translate-y-1 hover:border-amber-400 hover:bg-white/[0.075]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-amber-400/15 text-amber-400">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold text-white">{c.short}</span>
                <span className="text-[11.5px] leading-snug text-indigo-100/60">{c.description}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
