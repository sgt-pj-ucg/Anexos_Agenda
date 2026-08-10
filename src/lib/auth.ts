// El directorio es de acceso libre (sin clave). Solo la edición
// administrativa está protegida: quien quiera editar debe ingresar la
// clave de administrador desde el botón correspondiente en el encabezado.
//
// Las escrituras reales (agregar/editar/eliminar) están protegidas aparte,
// del lado del servidor: cada llamada RPC a Supabase vuelve a validar la
// clave de administrador antes de tocar la base de datos (ver
// supabase/schema.sql). Por eso aquí se retiene la clave de administrador
// en texto plano (solo en este navegador) — se necesita para acompañar
// cada escritura.
const STORAGE_KEY = 'pj-la-serena-directorio-auth'

export type Role = 'viewer' | 'admin'

// SHA-256 de la clave de administrador. Generado con:
//   node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('CLAVE')).then(b=>console.log(Buffer.from(b).toString('hex')))"
const ADMIN_HASH = 'bbc0da8fc88d3442496a2f02e2769ea11cf7300c6b816f3071cbe8862582ef7b' // Admin1849

interface StoredAuth {
  role: Role
  password?: string
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function checkAdminPassword(input: string): Promise<boolean> {
  const hash = await sha256Hex(input.trim())
  return hash === ADMIN_HASH
}

function readStored(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed.role === 'viewer' || parsed.role === 'admin') return parsed
    return null
  } catch {
    return null
  }
}

export function getRole(): Role {
  return readStored()?.role ?? 'viewer'
}

export function getAdminPassword(): string | null {
  const stored = readStored()
  return stored?.role === 'admin' ? (stored.password ?? null) : null
}

export function setAdmin(password: string): void {
  const stored: StoredAuth = { role: 'admin', password }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function lock(): void {
  localStorage.removeItem(STORAGE_KEY)
}
