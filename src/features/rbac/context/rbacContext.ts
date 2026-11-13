import { createContext } from 'react'

import type { AuthSession, BackendRoleCode, RoleNavItem } from '../types/roles'

export type RbacContextValue = {
  session: AuthSession
  roleCode: BackendRoleCode
  navigation: RoleNavItem[]
  routePrefix: string
  roleLabel: string
}

export const RbacContext = createContext<RbacContextValue | null>(null)
