import { describe, expect, it } from 'vitest'

import { flattenOvertimeFromAttendanceReport } from './flattenOvertimeFromAttendanceReport'

describe('flattenOvertimeFromAttendanceReport', () => {
  const meta = {
    employeeName: 'Jane Doe',
    employeeCode: 'HK0001',
    department: 'Engineering',
  }

  it('returns only days with overtime minutes', () => {
    const rows = flattenOvertimeFromAttendanceReport(
      {
        days: [
          { date: '2026-01-10', overtimeMinutes: 0, workingMinutes: 480 },
          { date: '2026-01-11', overtimeMinutes: 45, workingMinutes: 525 },
          { date: '2026-01-12', workingMinutes: 480 },
        ],
      },
      meta,
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      date: '2026-01-11',
      overtimeMinutes: 45,
      workingMinutes: 525,
      employeeName: 'Jane Doe',
      employeeCode: 'HK0001',
      department: 'Engineering',
    })
  })

  it('returns empty when no overtime days', () => {
    const rows = flattenOvertimeFromAttendanceReport(
      { days: [{ date: '2026-01-10', overtimeMinutes: 0 }] },
      meta,
    )
    expect(rows).toEqual([])
  })
})