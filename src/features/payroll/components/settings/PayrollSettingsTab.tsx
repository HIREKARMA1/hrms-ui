/**

 * Two-pane Payroll Settings: guards, validation routing, statutory cards.

 */



import { useEffect, useState } from 'react'



import type { PayrollSettingsSectionId } from '../../constants/payrollSettingsSections'

import {

  PAYROLL_SETTINGS_LEAVE_CONFIRM,

  registerPayrollSettingsGuard,

} from '../../hooks/payrollSettingsUnsavedBridge'

import { usePayrollSettingsForm } from '../../hooks/usePayrollSettingsForm'

import { usePayrollSettingsLeaveBlocker } from '../../hooks/usePayrollSettingsLeaveBlocker'

import { usePayrollSettingsNavigate } from '../../hooks/usePayrollSettingsNavigate'

import { usePayrollToast } from '../../hooks/usePayrollToast'

import { PayrollSettingsIntroCard } from './PayrollSettingsIntroCard'

import { PayrollSettingsSectionMenu } from './PayrollSettingsSectionMenu'

import { PayrollSettingsSectionPanel } from './PayrollSettingsSectionPanel'

import { SettingsSaveBar } from './SettingsSaveBar'

import { PayrollSettingsSectionFrame } from './shared/PayrollSettingsSectionFrame'



export function PayrollSettingsTab() {

  const { draft, setDraft, isDirty, fieldErrors, issues, slabErrorsById, handleSave, discard } =

    usePayrollSettingsForm()

  const { showToast } = usePayrollToast()

  const { navigateToTab } = usePayrollSettingsNavigate()

  const [active, setActive] = useState<PayrollSettingsSectionId>('pay-cycle')



  usePayrollSettingsLeaveBlocker(isDirty)



  useEffect(() => {

    registerPayrollSettingsGuard({

      isDirty,

      promptConfirm: () => window.confirm(PAYROLL_SETTINGS_LEAVE_CONFIRM),

    })

    return () => registerPayrollSettingsGuard(null)

  }, [isDirty])



  async function onSave() {

    const result = await handleSave()

    if (!result.ok) {

      if (result.firstErrorSection) setActive(result.firstErrorSection)

      showToast('Fix validation errors before saving.')

      return

    }

    showToast('Payroll settings saved.')

  }



  return (

    <div className="pb-28">

      <PayrollSettingsIntroCard onNavigateTab={navigateToTab} />

      <div className="mt-5 flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start">

        <PayrollSettingsSectionMenu active={active} onSelect={setActive} issues={issues} isDirty={isDirty} />

        <section aria-label="Active settings section" className="min-w-0 flex-1 rounded-xl border border-hrms-border bg-white p-4 shadow-sm sm:p-6">

          <PayrollSettingsSectionFrame sectionId={active} onNavigateTab={navigateToTab}>

            <PayrollSettingsSectionPanel

              sectionId={active}

              draft={draft}

              slabErrorsById={slabErrorsById}

              onChange={setDraft}

            />

          </PayrollSettingsSectionFrame>

        </section>

      </div>

      <SettingsSaveBar isDirty={isDirty} errors={fieldErrors} onSave={() => void onSave()} onDiscard={discard} />

    </div>

  )

}
