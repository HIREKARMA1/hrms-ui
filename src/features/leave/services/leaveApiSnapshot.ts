/**
 * Builds the Leave screens' snapshot from server data for signed-in users,
 * and decides which leave endpoints the caller may query.
 *
 * Anything the backend does not store (ledger rows, comp-off, delegations,
 * accrual run history, settings history) stays empty rather than mocked.
 */

import type { FeatureAccessKey } from '@/features/rbac/types/features'

import type { EncashmentPage, LeaveRequestPage } from '../api/leaveApi'
import { buildServerLeaveSettings, mergeLeaveEmployees, type LeaveTypeOption } from '../api/leaveMappers'
import type { LeaveEmployee } from '../types/employee'
import type { LeaveSnapshot } from './leaveService'

/**
 * Which leave reads the caller can make. List endpoints without an elevated
 * permission are scoped by the server to the caller's linked employee, so
 * they are skipped while no employee link is known.
 */
export type LeaveApiAccess = {
  requests: boolean
  /** leaves:approve or leaves:create_on_behalf: the request list is org-wide. */
  orgWideRequests: boolean
  leaveTypes: boolean
  encashments: boolean
  employeeDirectory: boolean
}

export function resolveLeaveApiAccess(
  canAccess: (feature: FeatureAccessKey) => boolean,
  linkedEmployeeId: string | null,
): LeaveApiAccess {
  const canRead = canAccess('leave.requests')
  const orgWideRequests = canRead && (canAccess('leave.approve') || canAccess('leave.createOnBehalf'))
  const orgWideEncashments = canAccess('leave.encashments.view') && canAccess('leave.encashments.approve')
  return {
    requests: orgWideRequests || (canRead && linkedEmployeeId !== null),
    orgWideRequests,
    leaveTypes: canAccess('leave.types'),
    encashments: orgWideEncashments || (canAccess('leave.encashments.view') && linkedEmployeeId !== null),
    employeeDirectory: canAccess('employee.directory'),
  }
}

export type LeaveApiMeta = {
  access: LeaveApiAccess
  leaveTypes: LeaveTypeOption[]
  /** Server total for the request list; `requests` holds the first page only. */
  requestTotal: number
  encashmentTotal: number
}

export function buildApiLeaveSnapshot(input: {
  access: LeaveApiAccess
  requests?: LeaveRequestPage
  leaveTypes?: LeaveTypeOption[]
  encashments?: EncashmentPage
  directory?: LeaveEmployee[]
}): LeaveSnapshot {
  const leaveTypes = input.leaveTypes ?? []
  return {
    employees: mergeLeaveEmployees(
      input.directory ?? [],
      input.requests?.employees ?? [],
      input.encashments?.employees ?? [],
    ),
    settings: buildServerLeaveSettings(leaveTypes),
    requests: input.requests?.items ?? [],
    ledger: [],
    compOffLots: [],
    compOffRequests: [],
    encashments: input.encashments?.items ?? [],
    delegations: [],
    accrualRuns: [],
    yearEndRuns: [],
    settingsHistory: [],
    api: {
      access: input.access,
      leaveTypes,
      requestTotal: input.requests?.pagination.total ?? 0,
      encashmentTotal: input.encashments?.pagination.total ?? 0,
    },
  }
}
