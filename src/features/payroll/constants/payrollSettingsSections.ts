/**
 * Payroll Settings left-nav sections (company-wide policy; Phase 1 layout).
 */

import {
  BadgeIndianRupee,
  CalendarClock,
  Landmark,
  Layers,
  LogOut,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export type PayrollSettingsSectionId =
  | 'pay-cycle'
  | 'pay-components'
  | 'pf-esi'
  | 'professional-tax'
  | 'variable-pay'
  | 'exit-settlement'

export type PayrollSettingsSectionMeta = {
  id: PayrollSettingsSectionId
  label: string
  description: string
  icon: LucideIcon
}

export const PAYROLL_SETTINGS_SECTIONS: PayrollSettingsSectionMeta[] = [
  {
    id: 'pay-cycle',
    label: 'Pay cycle',
    description: 'When salary is paid and how loss-of-pay days are calculated.',
    icon: CalendarClock,
  },
  {
    id: 'pay-components',
    label: 'Pay components',
    description: 'Template for salary breakdown. Each employee is configured under Salary Structures.',
    icon: Layers,
  },
  {
    id: 'pf-esi',
    label: 'PF & ESI',
    description: 'Provident fund and employees’ state insurance rates and limits.',
    icon: BadgeIndianRupee,
  },
  {
    id: 'professional-tax',
    label: 'Professional tax',
    description: 'State slabs applied to monthly gross for professional tax.',
    icon: Landmark,
  },
  {
    id: 'variable-pay',
    label: 'Variable pay policy',
    description: 'Overtime, bonus, and how variable pay affects statutory wages.',
    icon: Sparkles,
  },
  {
    id: 'exit-settlement',
    label: 'Exit & settlement',
    description: 'Rules for leave encashment, notice recovery, and gratuity on full & final.',
    icon: LogOut,
  },
]

export const PAYROLL_SETTINGS_SECTION_USES: Record<PayrollSettingsSectionId, string[]> = {
  'pay-cycle': ['Monthly payroll run', 'Loss of pay'],
  'pay-components': ['Salary Structures', 'Payslip breakdown'],
  'pf-esi': ['PF / ESI deductions', 'Structure preview'],
  'professional-tax': ['PT deduction', 'Payslip'],
  'variable-pay': ['Variable Pay tab', 'Overtime & bonus runs'],
  'exit-settlement': ['Final Settlement tab'],
}