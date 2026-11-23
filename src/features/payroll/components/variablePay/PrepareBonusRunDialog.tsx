/**

 * Dialog to prepare a bonus run with per-employee preview rows.

 * Uses shared PayrollDialog shell; used from BonusTab.

 */



import { useState } from 'react'



import { Input } from '@/components/ui/input'



import { BONUS_RUN_TYPES } from '../../constants/variablePayLabels'

import { usePayrollActiveEmployees } from '../../hooks/usePayrollActiveEmployees'

import { usePayroll } from '../../hooks/usePayroll'

import type { BonusRun, BonusRunLine, BonusRunType } from '../../types/variablePay'

import { buildBonusPreviewLines } from '../../utils/buildBonusPreviewLines'

import {

  PayrollDialogBody,

  PayrollDialogCloseButton,

  PayrollDialogContent,

  PayrollDialogFooter,
  PayrollDialogFooterActions,

  PayrollDialogHeader,

  PayrollDialogOverlay,

  PayrollDialogPortal,

  PayrollDialogRoot,

} from '../shared/PayrollDialog'

import { PayrollDialogField } from '../shared/PayrollDialogField'

import { PAYROLL_DIALOG_SELECT } from '../shared/payrollUi'
import { formatMonth } from '../../utils/formatMonth'

import { BonusRunPreviewStep } from './BonusRunPreviewStep'

type PrepareBonusRunDialogProps = {

  open: boolean

  onOpenChange: (open: boolean) => void

  onPrepared: () => void

}



export function PrepareBonusRunDialog({ open, onOpenChange, onPrepared }: PrepareBonusRunDialogProps) {

  const { settings, structures, payrollMonth, upsertBonusRun } = usePayroll()

  const activeEmployees = usePayrollActiveEmployees()

  const [bonusType, setBonusType] = useState<BonusRunType>('Statutory')

  const [periodLabel, setPeriodLabel] = useState('FY 2025–26')

  const [payoutMonth, setPayoutMonth] = useState(payrollMonth)

  const [lines, setLines] = useState<BonusRunLine[]>([])

  const [step, setStep] = useState<'meta' | 'preview'>('meta')



  async function handleSaveDraft() {

    const run: BonusRun = {

      id: `BR-${Date.now()}`,

      bonusType,

      periodLabel,

      payoutMonth,

      status: 'Draft',

      createdAt: new Date().toISOString().slice(0, 10),

      lines,

    }

    await upsertBonusRun(run)

    onPrepared()

    onOpenChange(false)

    setStep('meta')

    setLines([])

  }



  return (

    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>

      <PayrollDialogPortal>

        <PayrollDialogOverlay />

        <PayrollDialogContent size="md" className="p-0">

          <PayrollDialogHeader
            title={step === 'meta' ? 'New bonus run' : 'Bonus run preview'}
            description={
              step === 'preview'
                ? `${bonusType} · ${periodLabel} · Payout ${formatMonth(payoutMonth)}`
                : undefined
            }
          />

          {step === 'meta' ? (

            <>

              <PayrollDialogBody>

                <PayrollDialogField label="Type" htmlFor="br-type">

                  <select

                    id="br-type"

                    className={PAYROLL_DIALOG_SELECT}

                    value={bonusType}

                    onChange={(e) => setBonusType(e.target.value as BonusRunType)}

                  >

                    {BONUS_RUN_TYPES.map((item) => (

                      <option key={item} value={item}>

                        {item}

                      </option>

                    ))}

                  </select>

                </PayrollDialogField>

                <PayrollDialogField label="Period label" htmlFor="br-period">

                  <Input

                    id="br-period"

                    value={periodLabel}

                    onChange={(e) => setPeriodLabel(e.target.value)}

                  />

                </PayrollDialogField>

                <PayrollDialogField label="Payout month" htmlFor="br-payout">

                  <Input

                    id="br-payout"

                    type="month"

                    value={payoutMonth}

                    onChange={(e) => setPayoutMonth(e.target.value)}

                  />

                </PayrollDialogField>

              </PayrollDialogBody>

              <PayrollDialogFooter>
                <PayrollDialogFooterActions
                  primaryLabel="Prepare"
                  onPrimary={() => {
                    setLines(buildBonusPreviewLines(activeEmployees, structures, settings, bonusType))
                    setStep('preview')
                  }}
                />
              </PayrollDialogFooter>

            </>

          ) : (

            <BonusRunPreviewStep
              bonusType={bonusType}
              lines={lines}

              employees={activeEmployees}

              settings={settings}

              structures={structures}

              onChange={setLines}

              onBack={() => setStep('meta')}

              onCreate={() => void handleSaveDraft()}

            />

          )}

          <PayrollDialogCloseButton />

        </PayrollDialogContent>

      </PayrollDialogPortal>

    </PayrollDialogRoot>

  )

}

