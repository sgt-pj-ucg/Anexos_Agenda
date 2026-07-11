// Protección de acceso liviana para uso interno: no es un mecanismo de
// seguridad criptográfica robusta (la app es estática y se ejecuta en el
// navegador del usuario), pero evita que la agenda sea navegable por
// cualquiera que llegue al enlace o que quede indexada en buscadores.
const STORAGE_KEY = 'pj-la-serena-directorio-auth'

// SHA-256 de la clave de acceso interna. Generado con:
//   node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('CLAVE')).then(b=>console.log(Buffer.from(b).toString('hex')))"
export const PASSWORD_HASH = '1bee1763b075b1b81fcaa6890ff684a29dc3ed892d630076f8e23acc73a0257c'

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function checkPassword(input: string): Promise<boolean> {
  const hash = await sha256Hex(input.trim())
  return hash === PASSWORD_HASH
}

export function isUnlocked(): boolean {
  return localStorage.getItem(STORAGE_KEY) === PASSWORD_HASH
}

export function unlock(): void {
  localStorage.setItem(STORAGE_KEY, PASSWORD_HASH)
}

export function lock(): void {
  localStorage.removeItem(STORAGE_KEY)
}
