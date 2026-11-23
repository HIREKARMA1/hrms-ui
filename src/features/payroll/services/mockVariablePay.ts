/**
 * Mock overtime and incentive records for Oct and Nov 2026 payroll months.
 * Seeded in payrollMockStore for Variable Pay tab development.
 */

import type { IncentiveEntry, OvertimeEntry } from '../types/variablePay'

export const mockOvertimeEntries: OvertimeEntry[] = [
  {
    id: 'OT-001',
    employeeId: 'EMP-1001',
    payrollMonth: '2026-11',
    hours: 12,
    ratePerHour: 481,
    amount: 5772,
    source: 'Manual',
    note: 'Release weekend support',
    status: 'Approved',
  },
  {
    id: 'OT-002',
    employeeId: 'EMP-1003',
    payrollMonth: '2026-11',
    hours: 8,
    ratePerHour: 385,
    amount: 3080,
    source: 'Manual',
    status: 'Pending approval',
  },
  {
    id: 'OT-003',
    employeeId: 'EMP-1005',
    payrollMonth: '2026-11',
    hours: 6,
    ratePerHour: 420,
    amount: 2520,
    source: 'Manual',
    status: 'Approved',
  },
  {
    id: 'OT-004',
    employeeId: 'EMP-1002',
    payrollMonth: '2026-10',
    hours: 10,
    ratePerHour: 450,
    amount: 4500,
    source: 'Manual',
    status: 'Approved',
  },
  {
    id: 'OT-005',
    employeeId: 'EMP-1007',
    payrollMonth: '2026-11',
    hours: 4,
    ratePerHour: 300,
    amount: 1200,
    source: 'Manual',
    status: 'Rejected',
    rejectionReason: 'Not pre-approved by manager',
  },
  {
    id: 'OT-006',
    employeeId: 'EMP-1008',
    payrollMonth: '2026-11',
    hours: 16,
    ratePerHour: 360,
    amount: 5760,
    source: 'Manual',
    status: 'Pending approval',
  },
]

export const mockIncentiveEntries: IncentiveEntry[] = [
  {
    id: 'INC-001',
    employeeId: 'EMP-1004',
    payrollMonth: '2026-11',
    incentiveType: 'Sales commission',
    amount: 8500,
    note: 'Q3 enterprise deals',
    status: 'Approved',
  },
  {
    id: 'INC-003',
    employeeId: 'EMP-1010',
    payrollMonth: '2026-11',
    incentiveType: 'Referral',
    amount: 3000,
    status: 'Pending approval',
  },
  {
    id: 'INC-004',
    employeeId: 'EMP-1009',
    payrollMonth: '2026-10',
    incentiveType: 'Other',
    amount: 2000,
    status: 'Approved',
  },
]
