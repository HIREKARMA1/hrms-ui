function parseDeviceClockSeconds(time: string): number | null {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim())
  if (!match) return null
  return (
    Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] ?? 0)
  )
}

/** Duration between device check-in and check-out (same calendar day). */
export function formatDeviceWorkingDuration(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
): string {
  if (!checkIn?.trim() || !checkOut?.trim()) return '—'
  const start = parseDeviceClockSeconds(checkIn)
  const end = parseDeviceClockSeconds(checkOut)
  if (start == null || end == null || end <= start) return '—'
  const seconds = end - start
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}