// El directorio es de acceso libre (sin clave). Solo la edición
// administrativa está protegida: cada administrador ingresa con su propio
// RUT y clave de acceso (lista a cargo del administrador general, ver
// supabase/migration_011_admins_por_rut.sql).
//
// Las escrituras reales (agregar/editar/eliminar) están protegidas aparte,
// del lado del servidor: cada llamada RPC a Supabase vuelve a validar la
// clave contra la lista de administradores antes de tocar la base de datos
// (ver supabase/schema.sql, función verify_admin). Por eso aquí se retiene
// la clave en texto plano (solo en este navegador) — se necesita para
// acompañar cada escritura, y también para que el servidor identifique al
// administrador y deje registro de quién hizo cada cambio (trazabilidad).
import { supabase } from './supabaseClient'
import { normalizeRut } from './rut'

const STORAGE_KEY = 'pj-la-serena-directorio-auth'

export type Role = 'viewer' | 'admin'

interface StoredAuth {
  role: Role
  password?: string
  nombre?: string
}

// Devuelve el nombre del administrador si el RUT y la clave son correctos,
// o null si no lo son.
export async function checkAdminLogin(rut: string, password: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('verify_admin_login', {
    admin_rut: normalizeRut(rut),
    admin_password: password,
  })
  if (error || !data) return null
  return data as string
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

export function getAdminNombre(): string | null {
  const stored = readStored()
  return stored?.role === 'admin' ? (stored.nombre ?? null) : null
}

export function setAdmin(password: string, nombre: string): void {
  const stored: StoredAuth = { role: 'admin', password, nombre }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function lock(): void {
  localStorage.removeItem(STORAGE_KEY)
}
