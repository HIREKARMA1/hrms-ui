import type { BiometricAttendanceDay } from '../types/api/biometricAttendance.types'
import {
  formatBiometricPunchTime,
  formatBiometricWorkedMinutes,
} from './biometricAttendanceUi'

type BiometricAttendanceDaysTableProps = {
  days: BiometricAttendanceDay[]
}

export function BiometricAttendanceDaysTable({ days }: BiometricAttendanceDaysTableProps) {
  if (days.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-navy">Daily summary</p>
      <div className="overflow-x-auto rounded-xl border border-border-soft">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border-soft bg-app-bg text-text-secondary">
            <tr>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">First in</th>
              <th className="px-3 py-2 font-medium">Last out</th>
              <th className="px-3 py-2 font-medium">First punch</th>
              <th className="px-3 py-2 font-medium">Last punch</th>
              <th className="px-3 py-2 font-medium">Punches</th>
              <th className="px-3 py-2 font-medium">Worked</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.date} className="border-b border-border-soft last:border-0">
                <td className="px-3 py-2 whitespace-nowrap text-navy">{day.date}</td>
                <td className="px-3 py-2 whitespace-nowrap text-text-secondary">
                  {day.firstIn ? formatBiometricPunchTime(day.firstIn) : '—'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-text-secondary">
                  {day.lastOut ? formatBiometricPunchTime(day.lastOut) : '—'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-text-secondary">
                  {day.firstPunch ? formatBiometricPunchTime(day.firstPunch) : '—'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-text-secondary">
                  {day.lastPunch ? formatBiometricPunchTime(day.lastPunch) : '—'}
                </td>
                <td className="px-3 py-2 text-text-secondary">{day.punchCount}</td>
                <td className="px-3 py-2 text-navy">
                  {formatBiometricWorkedMinutes(day.workedMinutes)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
