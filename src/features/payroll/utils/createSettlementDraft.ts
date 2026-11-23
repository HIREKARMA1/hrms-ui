/**
 * Empty draft settlement for the New settlement sheet before first save.
 * Used by FinalSettlementTab when opening an unsaved panel.
 */

import { MOCK_SETTLEMENT_ACTOR } from '../constants/variablePayLabels'
import type { FinalSettlement } from '../types/finalSettlement'
import { todayIsoDate } from './formatDate'

export function createSettlementDraft(employeeId: string, payrollMonth: string): FinalSettlement {
  return {
    id: `FFS-${Date.now()}`,
    employeeId,
    resignationDate: `${payrollMonth}-01`,
    lastWorkingDay: `${payrollMonth}-15`,
    noticePeriodDaysRequired: 30,
    noticeDaysServed: 14,
    status: 'Draft',
    earningsLines: [],
    deductionLines: [],
    tds: 0,
    totalEarnings: 0,
    totalDeductions: 0,
    netPayable: 0,
    timeline: [{ stage: 'Draft', actor: MOCK_SETTLEMENT_ACTOR, date: todayIsoDate() }],
  }
}
