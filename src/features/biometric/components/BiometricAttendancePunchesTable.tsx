import type { BiometricPunch } from '../types/api/biometricAttendance.types'
import { formatBiometricPunchTime } from './biometricAttendanceUi'

type BiometricAttendancePunchesTableProps = {
  punches: BiometricPunch[]
}

export function BiometricAttendancePunchesTable({ punches }: BiometricAttendancePunchesTableProps) {
  if (punches.length === 0) {
    return <p className="text-sm text-text-secondary">No punches in this date range.</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border-soft">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-border-soft bg-app-bg text-text-secondary">
          <tr>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Direction</th>
            <th className="px-3 py-2 font-medium">Device</th>
          </tr>
        </thead>
        <tbody>
          {punches.map((row, index) => (
            <tr key={row.id ?? `${row.punchedAt}-${index}`} className="border-b border-border-soft last:border-0">
              <td className="px-3 py-2 text-navy">{formatBiometricPunchTime(row.punchedAt)}</td>
              <td className="px-3 py-2 text-text-secondary">{row.direction ?? '—'}</td>
              <td className="px-3 py-2 font-mono text-xs">{row.deviceCode ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}