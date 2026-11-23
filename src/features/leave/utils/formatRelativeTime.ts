/**
 * Relative timestamps for Overview activity (full ISO in tooltips).
 */

import { leaveToday } from './leaveToday'

export function formatRelativeTime(iso: string): string {
  const at = new Date(iso.includes('T') ? iso : `${iso.slice(0, 10)}T12:00:00`)
  const now = leaveToday()
  const diffMs = now.getTime() - at.getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} ago`
  return at.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
