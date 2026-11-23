import { describe, expect, it } from 'vitest'

import type { AuthUser } from '../types/auth.types'
import { getSafeReturnPath } from './returnPath'

function makeUser(role: string, roles: string[]): AuthUser {
  return {
    id: 'u-1',
    email: 'user@hrms.test',
    role,
    roles: [...roles].sort(),
    permissions: [],
    isActive: true,
  }
}

const from = (path: string) => ({ from: path })

describe('getSafeReturnPath with multiple roles', () => {
  const hrAdmin = makeUser('EMPLOYEE', ['EMPLOYEE', 'HR_ADMIN'])

  it('returns to an authorized workspace page for a multi-role user', () => {
    expect(getSafeReturnPath(from('/admin/employees'), hrAdmin)).toBe('/admin/employees')
    expect(getSafeReturnPath(from('/employee/leave?tab=a#x'), hrAdmin)).toBe(
      '/employee/leave?tab=a#x',
    )
  })

  it('does not return into a workspace the user does not hold', () => {
    expect(getSafeReturnPath(from('/hr/dashboard'), hrAdmin)).toBeNull()
    expect(getSafeReturnPath(from('/superadmin/dashboard'), hrAdmin)).toBeNull()
  })

  it('a plain employee is not returned into the HR_ADMIN workspace', () => {
    expect(getSafeReturnPath(from('/admin/employees'), makeUser('EMPLOYEE', ['EMPLOYEE']))).toBeNull()
  })

  it('does not depend on role priority: a lower held role is still authorized', () => {
    const superAdmin = makeUser('SUPER_ADMIN', ['EMPLOYEE', 'SUPER_ADMIN'])
    expect(getSafeReturnPath(from('/employee/dashboard'), superAdmin)).toBe('/employee/dashboard')
    expect(getSafeReturnPath(from('/admin/dashboard'), superAdmin)).toBeNull()
  })

  it('allows shared legacy routes (not role workspaces)', () => {
    expect(getSafeReturnPath(from('/employees'), hrAdmin)).toBe('/employees')
  })

  it('rejects unsafe or public targets', () => {
    expect(getSafeReturnPath(from('//evil.example'), hrAdmin)).toBeNull()
    expect(getSafeReturnPath(from('https://evil.example'), hrAdmin)).toBeNull()
    expect(getSafeReturnPath(from('/'), hrAdmin)).toBeNull()
    expect(getSafeReturnPath(from('/forgot-password'), hrAdmin)).toBeNull()
    expect(getSafeReturnPath(undefined, hrAdmin)).toBeNull()
    expect(getSafeReturnPath(from('/admin/employees'), null)).toBeNull()
  })
})
