import type {
  AttendanceRegularizationListResult,
  AttendanceRegularizationMutationResult,
  AttendanceRegularizationRecord,
} from '../types/api/attendanceRegularization.types'
import {
  coerceNumber,
  coerceOptionalString,
  pickItemsArray,
  unwrapRecord,
} from '@/features/biometric/utils/biometricApiCoerce'

function mapRegularization(raw: unknown): AttendanceRegularizationRecord | null {
  const o = unwrapRecord(raw)
  const id = coerceOptionalString(o.id)
  if (!id) return null
  const datesRaw = Array.isArray(o.dates)
    ? o.dates
    : Array.isArray(o.attendanceDates)
      ? o.attendanceDates
      : coerceOptionalString(o.date)
        ? [coerceOptionalString(o.date)!]
        : []
  return {
    id,
    employeeId: coerceOptionalString(o.employeeId),
    employeeCode: coerceOptionalString(o.employeeCode),
    type: coerceOptionalString(o.type) as AttendanceRegularizationRecord['type'],
    dates: datesRaw.map(String),
    reason: coerceOptionalString(o.reason),
    createdAt: coerceOptionalString(o.createdAt ?? o.created_at),
    revokedAt: coerceOptionalString(o.revokedAt ?? o.revoked_at) ?? null,
    createdBy: coerceOptionalString(o.createdBy ?? o.createdByUserId),
  }
}

export function normalizeAttendanceRegularizationList(raw: unknown): AttendanceRegularizationListResult {
  const root = unwrapRecord(raw)
  const items = pickItemsArray(root.items ?? root.data ?? root.results ?? raw)
    .map(mapRegularization)
    .filter((item): item is AttendanceRegularizationRecord => item !== null)
  return {
    items,
    page: coerceNumber(root.page) ?? 1,
    limit: coerceNumber(root.limit) ?? items.length,
    total: coerceNumber(root.total ?? root.totalCount),
  }
}

export function normalizeAttendanceRegularizationMutation(
  raw: unknown,
): AttendanceRegularizationMutationResult {
  const root = unwrapRecord(raw)
  const items = pickItemsArray(root.items ?? root.created ?? root.regularizations ?? root)
    .map(mapRegularization)
    .filter((item): item is AttendanceRegularizationRecord => item !== null)
  const single = mapRegularization(root)
  return { items: items.length ? items : single ? [single] : [] }
}