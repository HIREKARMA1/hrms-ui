import { describe, expect, it } from 'vitest'

import { formatDashboardSummaryLabel, formatLeaveTypeBalanceOptionLabel } from './formatLeaveBalanceDisplay'

describe('formatLeaveBalanceDisplay', () => {
  it('splits PascalCase dashboard labels', () => {
    expect(formatDashboardSummaryLabel('PaidLeaveAvailable')).toBe('Paid Leave Available')
  })

  it('formats apply option label', () => {
    expect(formatLeaveTypeBalanceOptionLabel('Casual Leave', 1)).toBe('Casual Leave — 1 day available')
    expect(formatLeaveTypeBalanceOptionLabel('Sick Leave', 5)).toBe('Sick Leave — 5 days available')
  })
})