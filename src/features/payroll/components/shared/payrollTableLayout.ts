/**
 * Shared fixed-layout widths and cell alignment for payroll data tables.
 * Adjust column percentages here to retune all payroll tables at once.
 */

import { cn } from '@/lib/utils'

import { PAYROLL_TABLE_ROW, PAYROLL_TABLE_THEAD } from './payrollUi'

export const PAYROLL_TABLE_CLASS = 'w-full min-w-[760px] table-fixed text-left text-sm'

/** Tables with Approve / Reject pairs need a wider scroll area inside the card. */
export const PAYROLL_TABLE_CLASS_WIDE = 'w-full min-w-[920px] table-fixed text-left text-sm'

export type PayrollColumnAlign = 'text' | 'money' | 'actions'

export type PayrollCellRole = 'default' | 'name' | 'secondary' | 'keyMoney'

export const payrollTheadClass = PAYROLL_TABLE_THEAD

export const payrollTrClass = PAYROLL_TABLE_ROW

/** Percent widths per table; each array must sum to 100. */
export const PAYROLL_TABLE_WIDTHS = {
  finalSettlement: ['24%', '16%', '18%', '16%', '14%', '12%'],
  overtime: ['19%', '9%', '11%', '13%', '14%', '17%', '20%'],
  bonusRuns: ['18%', '22%', '16%', '14%', '14%', '16%'],
  incentives: ['15%', '12%', '11%', '12%', '12%', '17%', '21%'],
  salaryStructures: ['10%', '22%', '16%', '14%', '14%', '16%', '8%'],
} as const

export function payrollThClass(align: PayrollColumnAlign): string {
  return cn(
    'px-4 py-3 font-semibold whitespace-nowrap',
    align === 'text' && 'text-left',
    align === 'money' && 'text-right tabular-nums',
    align === 'actions' && 'text-right',
  )
}

export function payrollTdClass(
  align: PayrollColumnAlign,
  ellipsis = false,
  role: PayrollCellRole = 'default',
): string {
  return cn(
    'px-4 py-3 whitespace-nowrap',
    align === 'text' && 'text-left',
    align === 'money' && 'text-right tabular-nums',
    align === 'actions' && 'text-right',
    role === 'name' && 'font-medium text-hrms-navy',
    role === 'secondary' && 'text-hrms-text-secondary',
    role === 'keyMoney' && 'font-semibold text-hrms-navy',
    ellipsis && 'max-w-0 truncate',
  )
}
