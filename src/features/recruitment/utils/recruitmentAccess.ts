import type { FeatureAccessKey } from '@/features/rbac/types/features'

/**
 * Write access for Recruitment & ATS UI actions.
 * Super Admin is intentionally excluded from `recruitment.manage` in the
 * interim role matrix (read-only). Backend `@RequirePermission` remains
 * authoritative for API mutations.
 */
export function canManageRecruitment(
  canAccess: (feature: FeatureAccessKey) => boolean,
): boolean {
  return canAccess('recruitment.manage')
}
