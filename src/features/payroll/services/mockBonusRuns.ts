/**
 * Mock bonus runs with Draft, Approved, and Paid states for payout months.
 * Used by payrollMockStore and the Bonus sub-tab.
 */

import type { BonusRun } from '../types/variablePay'

export const mockBonusRuns: BonusRun[] = [
  {
    id: 'BR-STAT-2026',
    bonusType: 'Statutory',
    periodLabel: 'FY 2025–26',
    payoutMonth: '2026-11',
    status: 'Approved',
    createdAt: '2026-10-28',
    lines: [
      { employeeId: 'EMP-1007', included: true, amount: 8400, eligibleMonths: 12 },
      { employeeId: 'EMP-1008', included: true, amount: 8400, eligibleMonths: 12 },
      { employeeId: 'EMP-1009', included: true, amount: 6996, eligibleMonths: 12 },
      { employeeId: 'EMP-1001', included: false, amount: 0, eligibleMonths: 12 },
    ],
  },
  {
    id: 'BR-FEST-2026',
    bonusType: 'Festival',
    periodLabel: 'Diwali 2026',
    payoutMonth: '2026-11',
    status: 'Paid',
    createdAt: '2026-10-15',
    lines: [
      { employeeId: 'EMP-1001', included: true, amount: 15000 },
      { employeeId: 'EMP-1002', included: true, amount: 12000 },
      { employeeId: 'EMP-1003', included: true, amount: 10000 },
    ],
  },
  {
    id: 'BR-PERF-DRAFT',
    bonusType: 'Performance',
    periodLabel: 'H1 2026',
    payoutMonth: '2026-11',
    status: 'Draft',
    createdAt: '2026-11-05',
    lines: [
      { employeeId: 'EMP-1004', included: true, amount: 25000 },
      { employeeId: 'EMP-1005', included: true, amount: 18000 },
    ],
  },
  {
    id: 'BR-OCT',
    bonusType: 'Other',
    periodLabel: 'Spot award Oct',
    payoutMonth: '2026-10',
    status: 'Approved',
    createdAt: '2026-10-20',
    lines: [{ employeeId: 'EMP-1006', included: true, amount: 5000 }],
  },
]
