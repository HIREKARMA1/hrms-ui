import { describe, expect, it } from 'vitest'

import { canAccessFeature } from '@/features/rbac/services/permissionAdapter'

import { canManageRecruitment } from './recruitmentAccess'

describe('recruitment role access (interim matrix)', () => {
  it('gives Super Admin and HR Admin write access via recruitment.manage', () => {
    expect(canAccessFeature('recruitment.manage', 'SUPER_ADMIN', [])).toBe(true)
    expect(canAccessFeature('recruitment.manage', 'HR_ADMIN', [])).toBe(true)
    expect(
      canManageRecruitment((feature) =>
        canAccessFeature(feature, 'SUPER_ADMIN', []),
      ),
    ).toBe(true)
    expect(
      canManageRecruitment((feature) =>
        canAccessFeature(feature, 'HR_ADMIN', []),
      ),
    ).toBe(true)
  })

  it('gives Manager and Employee job board view without manage', () => {
    expect(canAccessFeature('recruitment.jobs', 'MANAGER', [])).toBe(true)
    expect(canAccessFeature('recruitment.jobs', 'EMPLOYEE', [])).toBe(true)
    expect(canAccessFeature('recruitment.manage', 'MANAGER', [])).toBe(false)
    expect(canAccessFeature('recruitment.manage', 'EMPLOYEE', [])).toBe(false)
    expect(canAccessFeature('recruitment.overview', 'MANAGER', [])).toBe(false)
    expect(canAccessFeature('recruitment.candidates', 'EMPLOYEE', [])).toBe(false)
    expect(
      canManageRecruitment((feature) =>
        canAccessFeature(feature, 'MANAGER', []),
      ),
    ).toBe(false)
  })
})
