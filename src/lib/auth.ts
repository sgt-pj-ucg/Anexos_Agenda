// Protección de acceso liviana para uso interno: no es un mecanismo de
// seguridad criptográfica robusta (la app es estática y se ejecuta en el
// navegador del usuario), pero evita que la agenda sea navegable por
// cualquiera que llegue al enlace o que quede indexada en buscadores.
const STORAGE_KEY = 'pj-la-serena-directorio-auth'

export type Role = 'viewer' | 'admin'

// SHA-256 de cada clave de acceso. Generadas con:
//   node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('CLAVE')).then(b=>console.log(Buffer.from(b).toString('hex')))"
const HASHES: Record<Role, string> = {
  viewer: '1bee1763b075b1b81fcaa6890ff684a29dc3ed892d630076f8e23acc73a0257c', // Corte1849
  admin: 'bbc0da8fc88d3442496a2f02e2769ea11cf7300c6b816f3071cbe8862582ef7b', // Admin1849
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function checkPassword(input: string): Promise<Role | null> {
  const hash = await sha256Hex(input.trim())
  for (const role of Object.keys(HASHES) as Role[]) {
    if (HASHES[role] === hash) return role
  }
  return null
}

export function getRole(): Role | null {
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'viewer' || v === 'admin' ? v : null
}

export function setRole(role: Role): void {
  localStorage.setItem(STORAGE_KEY, role)
}

export function lock(): void {
  localStorage.removeItem(STORAGE_KEY)
}
