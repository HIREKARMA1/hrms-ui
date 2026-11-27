/** Device wall-clock times from dashboard attendance APIs (HH:mm:ss). */
export function formatDeviceClockTime(time: string | null | undefined): string {
  if (!time?.trim()) return '—'
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time.trim())
  if (!match) return time
  return `${match[1]}:${match[2]}`
}