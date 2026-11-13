/**
 * Month-by-type leave taken rows for HR Reports tab.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { activeEmployees } from './employmentStatus'

export function leaveTakenByTypeRows(snapshot: LeaveSnapshot, year: string) {
  const totals = new Map<string, number>()
  const activeIds = new Set(activeEmployees(snapshot.employees).map((item) => item.id))
  for (const row of snapshot.requests) {
    if (row.status !== 'Approved' || !activeIds.has(row.employeeId)) continue
    if (!row.fromDate.startsWith(year)) continue
    const month = row.fromDate.slice(0, 7)
    const key = `${month}|${row.leaveTypeCode}`
    totals.set(key, (totals.get(key) ?? 0) + row.days)
  }
  return [...totals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, days]) => {
      const [month, type] = key.split('|')
      return [month, type, days] as (string | number)[]
    })
}

export function leaveTakenByDeptRows(snapshot: LeaveSnapshot, year: string) {
  const byId = Object.fromEntries(snapshot.employees.map((item) => [item.id, item]))
  const totals = new Map<string, number>()
  const activeIds = new Set(activeEmployees(snapshot.employees).map((item) => item.id))
  for (const row of snapshot.requests) {
    if (row.status !== 'Approved' || !activeIds.has(row.employeeId)) continue
    if (!row.fromDate.startsWith(year)) continue
    const month = row.fromDate.slice(0, 7)
    const dept = byId[row.employeeId]?.department ?? '—'
    const key = `${month}|${dept}`
    totals.set(key, (totals.get(key) ?? 0) + row.days)
  }
  return [...totals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, days]) => {
      const [month, dept] = key.split('|')
      return [month, dept, days] as (string | number)[]
    })
}
