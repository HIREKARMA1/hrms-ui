import { describe, expect, it } from 'vitest'

import { normalizeAttendanceReport } from './normalizeAttendanceReport'

describe('normalizeAttendanceReport', () => {
  it('maps Swagger policy payload with netWorkedMinutes and punches', () => {
    const result = normalizeAttendanceReport({
      employeeCode: 'HK0021',
      fromDate: '2026-11-24',
      toDate: '2026-11-24',
      source: 'stored',
      fallbackReason: 'TimeWatch gateway unreachable',
      summary: { absentDays: 0, totalWorkedMinutes: 0, presentDays: 0 },
      days: [
        {
          date: '2026-11-24',
          status: 'IN_PROGRESS',
          displayState: 'NONE',
          firstIn: '2026-11-24T10:20:22+05:30',
          netWorkedMinutes: 0,
          lateByMinutes: 12,
          punches: [{ punchTime: '2026-11-24T10:20:22+05:30', punchType: 'IN' }],
        },
      ],
    })

    expect(result.fallbackReason).toContain('unreachable')
    expect(result.summary?.totalWorkedMinutes).toBe(0)
    expect(result.days[0]?.status).toBe('IN_PROGRESS')
    expect(result.days[0]?.workingMinutes).toBe(0)
    expect(result.days[0]?.lateMinutes).toBe(12)
    expect(result.days[0]?.checkIn).toContain('10:20')
    expect(result.days[0]?.punches).toHaveLength(1)
  })

  it('maps lunchBreak on a day', () => {
    const result = normalizeAttendanceReport({
      days: [
        {
          date: '2026-11-24',
          lunchBreak: {
            outTime: '13:21',
            inTime: '14:13',
            durationMinutes: 52,
            exceededMinutes: 13,
            isExceeded: true,
          },
        },
      ],
    })
    expect(result.days[0]?.lunchBreak?.durationMinutes).toBe(52)
    expect(result.days[0]?.lunchBreak?.isExceeded).toBe(true)
  })

  it('reads days from nested data envelope', () => {
    const result = normalizeAttendanceReport({
      data: {
        employeeId: 'emp-1',
        employee: { fullName: 'Test User' },
        days: [{ date: '2026-11-20', attendanceStatus: 'ABSENT', displayState: 'NONE' }],
      },
    })

    expect(result.employeeId).toBe('emp-1')
    expect(result.employee?.fullName).toBe('Test User')
    expect(result.days[0]?.status).toBe('ABSENT')
  })
})