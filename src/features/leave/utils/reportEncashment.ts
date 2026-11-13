/**
 * Encashment report rows for HR Reports tab.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { activeEmployees } from './employmentStatus'

export function encashmentReportRows(snapshot: LeaveSnapshot) {
  const byId = Object.fromEntries(snapshot.employees.map((item) => [item.id, item]))
  const activeIds = new Set(activeEmployees(snapshot.employees).map((item) => item.id))
  return snapshot.encashments
    .filter((item) => activeIds.has(item.employeeId))
    .map((item) => [byId[item.employeeId]?.name ?? item.employeeId, item.days, item.status, item.appliedOn])
}
