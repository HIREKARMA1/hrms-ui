/**
 * In-page links from Payroll Settings to other payroll module tabs (Phase 2).
 */

import type { PayrollPageTabId } from '../hooks/usePayrollPageTabs'
import type { PayrollSettingsSectionId } from './payrollSettingsSections'

export type PayrollSettingsRelatedLink = {
  tab: PayrollPageTabId
  label: string
}

export const PAYROLL_SETTINGS_INTRO_LINKS: PayrollSettingsRelatedLink[] = [
  { tab: 'Overview', label: 'Payroll overview' },
  { tab: 'Salary Structures', label: 'Salary structures' },
  { tab: 'Variable Pay', label: 'Variable pay' },
  { tab: 'Final Settlement', label: 'Final settlement' },
]

export const PAYROLL_SETTINGS_SECTION_LINKS: Record<PayrollSettingsSectionId, PayrollSettingsRelatedLink[]> = {
  'pay-cycle': [{ tab: 'Overview', label: 'Monthly payroll run' }],
  'pay-components': [{ tab: 'Salary Structures', label: 'Employee salary structures' }],
  'pf-esi': [{ tab: 'Salary Structures', label: 'Preview PF / ESI on structures' }],
  'professional-tax': [{ tab: 'Overview', label: 'Payslips & payroll table' }],
  'variable-pay': [{ tab: 'Variable Pay', label: 'Overtime, bonus & incentives' }],
  'exit-settlement': [{ tab: 'Final Settlement', label: 'Full & final cases' }],
}