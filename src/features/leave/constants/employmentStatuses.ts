/**
 * Mirrors the Prisma schema enums; keep in sync. Do not import generated Prisma files in the UI.
 */

export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED'

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On leave',
  PROBATION: 'Probation',
  TERMINATED: 'Terminated',
}
