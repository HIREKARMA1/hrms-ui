import { describe, expect, it } from 'vitest'

import { canAccessFeature } from '@/features/rbac/services/permissionAdapter'

import { canManageRecruitment } from './recruitmentAccess'

describe('recruitment role access (interim matrix)', () => {
  it('gives Manager and HR Admin write access via recruitment.manage', () => {
    expect(canAccessFeature('recruitment.manage', 'MANAGER', [])).toBe(true)
    expect(canAccessFeature('recruitment.manage', 'HR_ADMIN', [])).toBe(true)
    expect(
      canManageRecruitment((feature) =>
        canAccessFeature(feature, 'MANAGER', []),
      ),
    ).toBe(true)
  })

  it('keeps Super Admin read-only (no recruitment.manage)', () => {
    expect(canAccessFeature('recruitment.manage', 'SUPER_ADMIN', [])).toBe(false)
    expect(canAccessFeature('recruitment.jobs', 'SUPER_ADMIN', [])).toBe(true)
    expect(canAccessFeature('recruitment.candidates', 'SUPER_ADMIN', [])).toBe(
      true,
    )
    expect(
      canManageRecruitment((feature) =>
        canAccessFeature(feature, 'SUPER_ADMIN', []),
      ),
    ).toBe(false)
  })

  it('denies Employee recruitment workspace features', () => {
    expect(canAccessFeature('recruitment.overview', 'EMPLOYEE', [])).toBe(false)
    expect(canAccessFeature('recruitment.manage', 'EMPLOYEE', [])).toBe(false)
  })
})
