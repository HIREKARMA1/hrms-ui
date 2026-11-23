/**
 * Time-based greeting for the HR Overview attention banner.
 */

import { leaveToday } from './leaveToday'

export function overviewGreeting(displayName: string): string {
  const hour = leaveToday().getHours()
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const first = displayName.split(' ')[0]?.replace(/\(.*\)/, '').trim() ?? displayName
  return `${part}, ${first}`
}
