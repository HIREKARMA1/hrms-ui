import type { FeatureAccessKey } from '@/features/rbac/types/features'

/**
 * Write access for Recruitment job management / ATS mutations.
 * Interim matrix: SUPER_ADMIN + HR_ADMIN only. Managers and Employees may
 * view/apply via `recruitment.jobs` but must not manage postings.
 * Backend `@RequirePermission` remains authoritative for API mutations.
 */
export function canManageRecruitment(
  canAccess: (feature: FeatureAccessKey) => boolean,
): boolean {
  return canAccess('recruitment.manage')
}
