import { describe, expect, it } from 'vitest'

import {
  buildAttendanceRegularizationTypeOptions,
  collectIssueCodesFromAttendanceReport,
} from './buildAttendanceRegularizationTypeOptions'

describe('buildAttendanceRegularizationTypeOptions', () => {
  it('returns no options until the report has loaded', () => {
    const result = buildAttendanceRegularizationTypeOptions({
      attendanceDate: '2026-11-25',
      reportLoaded: false,
      report: {
        days: [{ date: '2026-11-25', issues: ['LATE_ARRIVAL'] }],
      },
    })
    expect(result.submittable).toEqual([])
  })

  it('lists every issue on the selected date as submittable options', () => {
    const result = buildAttendanceRegularizationTypeOptions({
      attendanceDate: '2026-11-24',
      reportLoaded: true,
      report: {
        days: [
          {
            date: '2026-11-24',
            issues: ['MISSED_OUT_PUNCH', 'OVERTIME', 'LUNCH_EXCEEDED'],
          },
        ],
      },
    })
    expect(result.submittable.map((o) => o.value)).toEqual([
      'LUNCH_EXCEEDED',
      'MISSED_OUT_PUNCH',
      'OVERTIME',
    ])
  })

  it('returns empty when the day has no issues', () => {
    const result = buildAttendanceRegularizationTypeOptions({
      attendanceDate: '2026-11-26',
      reportLoaded: true,
      report: {
        days: [{ date: '2026-11-26', issues: [] }],
      },
    })
    expect(result.submittable).toEqual([])
  })

  it('filters report days by attendance date', () => {
    const codes = collectIssueCodesFromAttendanceReport(
      {
        days: [
          { date: '2026-11-19', issues: ['OVERTIME'] },
          { date: '2026-11-20', issues: ['LUNCH_LATE_IN'] },
        ],
      },
      '2026-11-20',
    )
    expect(codes).toEqual(['LUNCH_LATE_IN'])
  })
})
