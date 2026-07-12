import { createContext, useContext } from 'react'
import type { Role } from '../lib/auth'

export const RoleContext = createContext<Role>('viewer')

export function useIsAdmin(): boolean {
  return useContext(RoleContext) === 'admin'
}
