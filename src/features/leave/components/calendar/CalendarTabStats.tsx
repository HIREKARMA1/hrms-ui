/**
 * Stat cards for Calendar tab (holidays, leave days, pending).
 */

import { CalendarRange, Palmtree, Sun, Users } from 'lucide-react'
import { useMemo } from 'react'

import type { LeaveSnapshot } from '../../services/leaveService'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveStatGrid } from '../LeaveStatGrid'

type CalendarTabStatsProps = {
  snapshot: LeaveSnapshot
  monthPrefix: string
  /** When set, counts only this employee's leave (employee calendar). */
  employeeId?: string
  /** When set, counts leave for manager + direct reports. */
  teamMemberIds?: readonly string[]
  /** Server calendar spans; when set they replace snapshot requests for approved and on-leave counts. */
  approvedSpans?: readonly { startDate: string; endDate: string }[]
}

function overlapsMonth(fromDate: string, toDate: string, monthPrefix: string): boolean {
  const monthEnd = `${monthPrefix}-31`
  return fromDate <= monthEnd && toDate >= `${monthPrefix}-01`
}

export function CalendarTabStats({ snapshot, monthPrefix, employeeId, teamMemberIds, approvedSpans }: CalendarTabStatsProps) {
  const self = Boolean(employeeId)
  const team = Boolean(teamMemberIds?.length)
  const stats = useMemo(() => {
    const requests = employeeId
      ? snapshot.requests.filter((item) => item.employeeId === employeeId)
      : teamMemberIds?.length
        ? snapshot.requests.filter((item) => teamMemberIds.includes(item.employeeId))
        : snapshot.requests
    const holidays = snapshot.settings.holidays.filter((item) => item.date.startsWith(monthPrefix)).length
    const approved = requests.filter(
      (item) => item.status === 'Approved' && overlapsMonth(item.fromDate, item.toDate, monthPrefix),
    ).length
    const pending = requests.filter((item) => item.status === 'Pending').length
    const today = leaveTodayIso()
    const onLeaveToday = requests.filter(
      (item) =>
        (item.status === 'Approved' || item.status === 'Pending') &&
        item.fromDate <= today &&
        item.toDate >= today,
    ).length
    if (approvedSpans) {
      return {
        holidays,
        approved: approvedSpans.length,
        pending,
        // Spans only cover the shown month.
        onLeaveToday: today.startsWith(monthPrefix)
          ? approvedSpans.filter((item) => item.startDate <= today && item.endDate >= today).length
          : onLeaveToday,
      }
    }
    return { holidays, approved, pending, onLeaveToday }
  }, [approvedSpans, employeeId, snapshot, monthPrefix, teamMemberIds])

  return (
    <LeaveStatGrid
      items={[
        { label: 'Holidays this month', value: String(stats.holidays), icon: Palmtree, tone: 'primary' },
        {
          label: self ? 'Your leave this month' : team ? 'Team leave this month' : 'Approved leave spans',
          value: String(stats.approved),
          icon: CalendarRange,
          tone: 'success',
        },
        {
          label: self ? 'Your pending' : team ? 'Team pending' : 'Pending requests',
          value: String(stats.pending),
          icon: Users,
          tone: 'warning',
        },
        {
          label: self ? 'Your leave today' : team ? 'Team on leave today' : 'On leave today',
          value: String(stats.onLeaveToday),
          icon: Sun,
          tone: 'neutral',
        },
      ]}
    />
  )
}
