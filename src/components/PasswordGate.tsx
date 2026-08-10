import { useState, type ReactNode } from 'react'
import { getRole, type Role } from '../lib/auth'
import { RoleContext } from '../context/RoleContext'

export function PasswordGate({ children }: { children: ReactNode }) {
  const [role] = useState<Role>(() => getRole())
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>
}
