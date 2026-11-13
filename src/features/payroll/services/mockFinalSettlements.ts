/**
 * Three sample full and final settlements for list and panel UI states.
 * Loaded via payrollMockStore into the Final Settlement tab.
 */

import type { FinalSettlement } from '../types/finalSettlement'
import { MOCK_SETTLEMENT_ACTOR } from '../constants/variablePayLabels'

export const mockFinalSettlements: FinalSettlement[] = [
  {
    id: 'FFS-001',
    employeeId: 'EMP-1012',
    resignationDate: '2026-10-01',
    lastWorkingDay: '2026-10-31',
    noticePeriodDaysRequired: 30,
    noticeDaysServed: 30,
    status: 'Draft',
    earningsLines: [
      { id: 'e1', label: 'Salary (days worked)', amount: 82000 },
      { id: 'e2', label: 'Leave encashment', amount: 12000 },
    ],
    deductionLines: [{ id: 'd1', label: 'Loan outstanding', amount: 5000 }],
    tds: 8000,
    totalEarnings: 94000,
    totalDeductions: 13000,
    netPayable: 81000,
    timeline: [
      { stage: 'Draft', actor: MOCK_SETTLEMENT_ACTOR, date: '2026-11-02' },
    ],
  },
  {
    id: 'FFS-002',
    employeeId: 'EMP-1011',
    resignationDate: '2026-09-15',
    lastWorkingDay: '2026-10-15',
    noticePeriodDaysRequired: 60,
    noticeDaysServed: 45,
    status: 'Pending approval',
    earningsLines: [
      { id: 'e1', label: 'Salary (days worked)', amount: 45000 },
      { id: 'e2', label: 'Gratuity', amount: 185000 },
    ],
    deductionLines: [
      { id: 'd1', label: 'Notice period recovery', amount: 25000 },
    ],
    tds: 15000,
    totalEarnings: 230000,
    totalDeductions: 40000,
    netPayable: 190000,
    timeline: [
      { stage: 'Draft', actor: MOCK_SETTLEMENT_ACTOR, date: '2026-10-16' },
      { stage: 'Submitted', actor: MOCK_SETTLEMENT_ACTOR, date: '2026-10-18' },
    ],
  },
  {
    id: 'FFS-003',
    employeeId: 'EMP-1008',
    resignationDate: '2026-08-01',
    lastWorkingDay: '2026-08-31',
    noticePeriodDaysRequired: 30,
    noticeDaysServed: 30,
    status: 'Paid',
    earningsLines: [
      { id: 'e1', label: 'Salary (days worked)', amount: 78000 },
      { id: 'e2', label: 'Leave encashment', amount: 8000 },
    ],
    deductionLines: [],
    tds: 6000,
    totalEarnings: 86000,
    totalDeductions: 6000,
    netPayable: 80000,
    timeline: [
      { stage: 'Draft', actor: MOCK_SETTLEMENT_ACTOR, date: '2026-09-01' },
      { stage: 'Submitted', actor: MOCK_SETTLEMENT_ACTOR, date: '2026-09-02' },
      { stage: 'Approved', actor: MOCK_SETTLEMENT_ACTOR, date: '2026-09-03' },
      { stage: 'Paid', actor: MOCK_SETTLEMENT_ACTOR, date: '2026-09-08' },
    ],
  },
]
