import type { LateArrivalsShiftInfo } from '../api/employeeDashboardApi.types'
import { formatDeviceClockTime } from './formatDeviceClockTime'

export function formatLateArrivalsShiftHint(shift: LateArrivalsShiftInfo | undefined): string | null {
  if (!shift) return null
  const parts: string[] = []
  if (shift.name?.trim()) parts.push(shift.name.trim())
  if (shift.latestOnTimeCheckIn?.trim()) {
    parts.push(`on-time until ${formatDeviceClockTime(shift.latestOnTimeCheckIn)}`)
  } else if (shift.startTime?.trim() && shift.graceMinutes != null) {
    parts.push(`shift from ${shift.startTime} · ${shift.graceMinutes}m grace`)
  }
  return parts.length > 0 ? parts.join(' · ') : null
}