/**
 * Reads weekly-off from calendar view day payloads (monthly/daily).
 */
function truthyWeeklyOff(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true'
}

export function readIsWeeklyOffDay(record: Record<string, unknown>): boolean {
  if (truthyWeeklyOff(record.isWeeklyOff)) return true
  if (truthyWeeklyOff(record.is_weekly_off)) return true
  if (truthyWeeklyOff(record.weeklyOff)) return true
  if (truthyWeeklyOff(record.weekly_off)) return true
  const rule = record.weeklyOffRule ?? record.weekly_off_rule
  if (rule && typeof rule === 'object' && !Array.isArray(rule)) return true
  if (typeof rule === 'string' && rule.trim().length > 0) return true
  return false
}