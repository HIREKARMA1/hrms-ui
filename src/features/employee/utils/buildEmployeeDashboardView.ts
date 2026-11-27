import type { AttendanceDayRecord, AttendanceReportSummary } from '@/features/attendance/types/api/attendanceReport.types'
import {
  formatAttendanceDate,
  formatAttendanceTime,
  mapApiAttendanceStatus,
} from '@/features/attendance/utils/attendanceReportDisplay'
import type { OfficeHoliday } from '@/features/officeCalendar/types/officeCalendar'
import type { OfficeCalendarEvent } from '@/features/officeCalendar/types/officeCalendar'
import type { BackendLeaveBalance } from '@/features/leave/api/leaveApi.types'
import type { LeaveRequest } from '@/features/leave/types/leaveRequest'
import { formatDate } from '@/features/leave/utils/formatDate'

export type EmployeeDashboardStat = {
  id: string
  label: string
  value: string
}

export type EmployeeDashboardAttendanceRow = {
  key: string
  date: string
  checkIn: string
  checkOut: string
  status: string
}

export type EmployeeDashboardLeaveRow = {
  key: string
  typeLabel: string
  dateRange: string
  status: LeaveRequest['status']
}

export type EmployeeDashboardHolidayRow = {
  key: string
  name: string
  date: string
}

export type EmployeeDashboardAnnouncementRow = {
  id: string
  title: string
  date: string
}

function monthAttendanceRatio(summary: AttendanceReportSummary | undefined): string {
  if (!summary) return '—'
  const present = summary.presentDays ?? 0
  const accountable =
    present +
    (summary.absentDays ?? 0) +
    (summary.lateDays ?? 0) +
    (summary.halfDays ?? 0) +
    (summary.missedPunchDays ?? 0)
  if (accountable === 0) return String(present)
  return `${present}/${accountable}`
}

function sumLeaveBalanceAvailable(balance: BackendLeaveBalance | undefined): number {
  if (!balance?.items?.length) return 0
  return balance.items.reduce((sum, row) => sum + (row.availableLeaves ?? 0), 0)
}

function countPendingLeaveRequests(rows: LeaveRequest[]): number {
  return rows.filter((row) => row.status === 'Pending').length
}

function resolveNextHolidayName(holidays: OfficeHoliday[], todayIso: string): string {
  const upcoming = holidays
    .filter((item) => item.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
  return upcoming[0]?.name ?? '—'
}

function formatLeaveDateRange(fromDate: string, toDate: string): string {
  if (fromDate === toDate) return formatDate(fromDate)
  return `${formatDate(fromDate)} – ${formatDate(toDate)}`
}

export function buildAttendanceStatCards(
  summary: AttendanceReportSummary | undefined,
): EmployeeDashboardStat[] {
  return [
    {
      id: 'attendance',
      label: 'My Attendance This Month',
      value: monthAttendanceRatio(summary),
    },
    {
      id: 'present',
      label: 'Present Days',
      value: summary?.presentDays !== undefined ? String(summary.presentDays) : '—',
    },
    {
      id: 'absent',
      label: 'Absent Days',
      value: summary?.absentDays !== undefined ? String(summary.absentDays) : '—',
    },
  ]
}

export function buildLeaveStatCards(
  balance: BackendLeaveBalance | undefined,
  leaveHistory: LeaveRequest[],
): EmployeeDashboardStat[] {
  return [
    {
      id: 'balance',
      label: 'Leave Balance',
      value: balance ? String(sumLeaveBalanceAvailable(balance)) : '—',
    },
    {
      id: 'pending',
      label: 'Pending Leave Requests',
      value: String(countPendingLeaveRequests(leaveHistory)),
    },
  ]
}

export function buildHolidayStatCard(holidays: OfficeHoliday[], todayIso: string): EmployeeDashboardStat {
  return {
    id: 'holiday',
    label: 'Next Holiday',
    value: resolveNextHolidayName(holidays, todayIso),
  }
}

export function mapRecentAttendanceRows(
  days: AttendanceDayRecord[],
  limit = 5,
): EmployeeDashboardAttendanceRow[] {
  return days.slice(0, limit).map((day, index) => ({
    key: `${day.date}-${index}`,
    date: formatAttendanceDate(day.date),
    checkIn: formatAttendanceTime(day.checkIn),
    checkOut: formatAttendanceTime(day.checkOut),
    status: mapApiAttendanceStatus(day.status),
  }))
}

export function mapRecentLeaveRows(rows: LeaveRequest[], limit = 5): EmployeeDashboardLeaveRow[] {
  const sorted = [...rows].sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))
  return sorted.slice(0, limit).map((row) => ({
    key: row.id,
    typeLabel: row.leaveTypeCode,
    dateRange: formatLeaveDateRange(row.fromDate, row.toDate),
    status: row.status,
  }))
}

export function mapUpcomingHolidayRows(
  holidays: OfficeHoliday[],
  todayIso: string,
  limit = 5,
): EmployeeDashboardHolidayRow[] {
  return holidays
    .filter((item) => item.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
    .map((item) => ({
      key: item.id,
      name: item.name,
      date: formatDate(item.date),
    }))
}

function isAnnouncementEvent(event: OfficeCalendarEvent, rawType?: string): boolean {
  const normalized = (rawType ?? '').trim().toUpperCase()
  if (normalized === 'ANNOUNCEMENT') return true
  const title = event.title.toLowerCase()
  return title.includes('announcement') || title.includes('enrollment')
}

export function mapAnnouncementRows(
  events: OfficeCalendarEvent[],
  rawTypeById: ReadonlyMap<string, string>,
  limit = 5,
): EmployeeDashboardAnnouncementRow[] {
  const announcements = events.filter((event) =>
    isAnnouncementEvent(event, rawTypeById.get(event.id)),
  )
  const source = announcements.length > 0 ? announcements : events
  return source.slice(0, limit).map((event) => ({
    id: event.id,
    title: event.title,
    date: formatDate(event.startDate),
  }))
}