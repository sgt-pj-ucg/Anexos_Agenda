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
// acompañar cada escritura.
import { supabase } from './supabaseClient'
import { normalizeRut } from './rut'

const STORAGE_KEY = 'pj-la-serena-directorio-auth'

export type Role = 'viewer' | 'admin'

interface StoredAuth {
  role: Role
  password?: string
}

export async function checkAdminLogin(rut: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('verify_admin_login', {
    admin_rut: normalizeRut(rut),
    admin_password: password,
  })
  if (error) return false
  return data === true
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
