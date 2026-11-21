/**
 * Normalizes POST /calendar/holidays/{id}/notify response data.
 */
import type { HolidayNotifyResult } from '../types/api/holidayCalendar.types'

export function normalizeHolidayNotifyResult(raw: unknown): HolidayNotifyResult {
  const body =
    raw && typeof raw === 'object' && 'data' in raw
      ? (raw as { data: unknown }).data
      : raw
  const root = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  return {
    status: String(root.status ?? 'SENT'),
    recipientCount: Number(root.recipientCount ?? root.recipients) || undefined,
    sent: Number(root.sent) || undefined,
    failed: Number(root.failed) || undefined,
    notifiedAt: typeof root.notifiedAt === 'string' ? root.notifiedAt : undefined,
  }
}