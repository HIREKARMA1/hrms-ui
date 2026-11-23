/**
 * Scrollable bonus run preview with fixed footer actions in the prepare dialog.
 * Used on step two of PrepareBonusRunDialog.
 */

import { Button } from '@/components/ui/button'

import type { PayrollSettings } from '../../types/payrollSettings'
import type { SalaryStructure } from '../../types/salaryStructure'
import type { BonusRunLine, BonusRunType } from '../../types/variablePay'
import type { PayrollEmployee } from '../../types/payroll'
import {
  PayrollDialogBody,
  PayrollDialogFooter,
} from '../shared/PayrollDialog'
import { PAYROLL_SECONDARY_BUTTON } from '../shared/payrollUi'
import { cn } from '@/lib/utils'

import { BonusRunPreviewTable } from './BonusRunPreviewTable'

type BonusRunPreviewStepProps = {
  bonusType: BonusRunType
  lines: BonusRunLine[]
  employees: PayrollEmployee[]
  settings: PayrollSettings
  structures: SalaryStructure[]
  onChange: (lines: BonusRunLine[]) => void
  onBack: () => void
  onCreate: () => void
}

export function BonusRunPreviewStep({
  bonusType,
  lines,
  employees,
  settings,
  structures,
  onChange,
  onBack,
  onCreate,
}: BonusRunPreviewStepProps) {
  return (
    <>
      <PayrollDialogBody className="py-3">
        <BonusRunPreviewTable
          bonusType={bonusType}
          lines={lines}
          employees={employees}
          settings={settings}
          structures={structures}
          onChange={onChange}
        />
      </PayrollDialogBody>
      <PayrollDialogFooter>
        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" className={cn(PAYROLL_SECONDARY_BUTTON)} onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={onCreate}>
            Create run
          </Button>
        </div>
      </PayrollDialogFooter>
    </>
  )
}
