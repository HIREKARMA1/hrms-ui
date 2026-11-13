import { MainLayout } from '@/components/layout/MainLayout'

import { RbacProvider } from '../context/RbacProvider'
import type { BackendRoleCode } from '../types/roles'

type RoleLayoutProps = {
  roleCode: BackendRoleCode
}

/**
 * Reuses the existing MainLayout (sidebar + header) while injecting role context.
 */
export function RoleLayout({ roleCode }: RoleLayoutProps) {
  return (
    <RbacProvider roleCode={roleCode}>
      <MainLayout />
    </RbacProvider>
  )
}
