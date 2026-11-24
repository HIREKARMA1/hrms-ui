import { Badge } from '@/components/ui/badge'

import type { BiometricPunch } from '../types/api/biometricAttendance.types'
import { formatBiometricPunchTime } from './biometricAttendanceUi'

type BiometricAttendancePunchesTableProps = {
  punches: BiometricPunch[]
  /** Fallback device label when a punch row has no deviceCode. */
  deviceLabel?: string | null
}

function directionBadgeVariant(direction: string | null | undefined) {
  const value = (direction ?? '').toUpperCase()
  if (value === 'IN') return 'success' as const
  if (value === 'OUT') return 'warning' as const
  return 'secondary' as const
}

export function BiometricAttendancePunchesTable({
  punches,
  deviceLabel,
}: BiometricAttendancePunchesTableProps) {
  if (punches.length === 0) {
    return <p className="text-sm text-text-secondary">No punches in this date range.</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border-soft">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border-soft bg-app-bg text-text-secondary">
          <tr>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Direction</th>
            <th className="px-3 py-2 font-medium">Verify</th>
            <th className="px-3 py-2 font-medium">Device</th>
            <th className="px-3 py-2 font-medium">Device user</th>
            <th className="px-3 py-2 font-medium">Raw type</th>
            <th className="px-3 py-2 font-medium">Row id</th>
          </tr>
        </thead>
        <tbody>
          {punches.map((row, index) => (
            <tr
              key={row.id ?? `${row.punchedAt}-${index}`}
              className="border-b border-border-soft last:border-0"
            >
              <td className="px-3 py-2 whitespace-nowrap text-navy">
                {formatBiometricPunchTime(row.punchedAt)}
              </td>
              <td className="px-3 py-2">
                {row.direction ? (
                  <Badge variant={directionBadgeVariant(row.direction)}>{row.direction}</Badge>
                ) : (
                  <span className="text-text-secondary">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-text-secondary">{row.verifyMode ?? '—'}</td>
              <td className="px-3 py-2 font-mono text-xs">
                {row.deviceCode ?? deviceLabel ?? '—'}
              </td>
              <td className="px-3 py-2 font-mono text-xs text-text-secondary">
                {row.deviceUserId ?? '—'}
              </td>
              <td className="px-3 py-2 font-mono text-xs text-text-secondary">
                {row.rawPunchType ?? '—'}
              </td>
              <td className="px-3 py-2 font-mono text-xs text-text-secondary">
                {row.id ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
