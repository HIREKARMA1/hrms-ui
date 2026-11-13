/**

 * Payroll Settings tab with statutory configuration form.

 * Rendered from PayrollPage when the Settings tab is active.

 */



import {

  CA_COMPLIANCE_NOTICE,

  SALARY_SETTINGS_SECTION_DESC,

  VARIABLE_PAY_SETTINGS_NOTICE,

} from '../../constants/payrollRules'

import { usePayrollSettingsForm } from '../../hooks/usePayrollSettingsForm'

import { usePayrollToast } from '../../hooks/usePayrollToast'

import { BonusRulesCard } from './BonusRulesCard'

import { EsiSettingsCard } from './EsiSettingsCard'

import { FinalSettlementRulesCard } from './FinalSettlementRulesCard'

import { OvertimeRulesCard } from './OvertimeRulesCard'

import { PayrollCycleCard } from './PayrollCycleCard'

import { PfSettingsCard } from './PfSettingsCard'

import { ProfessionalTaxCard } from './ProfessionalTaxCard'

import { SalaryComponentsCard } from './SalaryComponentsCard'

import { SettingsSaveBar } from './SettingsSaveBar'

import { SettingsSectionHeading } from './SettingsSectionHeading'

import { VariablePayTreatmentCard } from './VariablePayTreatmentCard'



export function PayrollSettingsTab() {

  const { draft, setDraft, isDirty, fieldErrors, slabErrorsById, handleSave, discard } =

    usePayrollSettingsForm()

  const { showToast } = usePayrollToast()



  async function onSave() {

    const ok = await handleSave()

    if (ok) {

      showToast('Payroll settings saved.')

    }

  }



  return (

    <div className="flex flex-col gap-6 pb-28">

      <p className="text-sm text-hrms-text-secondary">{CA_COMPLIANCE_NOTICE}</p>

      <SettingsSectionHeading title="Salary and statutory rules" description={SALARY_SETTINGS_SECTION_DESC} />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">

        <div className="flex min-w-0 flex-1 flex-col gap-6">

          <SalaryComponentsCard draft={draft} onChange={setDraft} />

        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">

          <PfSettingsCard draft={draft} onChange={setDraft} />

          <EsiSettingsCard draft={draft} onChange={setDraft} />

          <PayrollCycleCard draft={draft} onChange={setDraft} />

        </div>

      </div>

      <ProfessionalTaxCard draft={draft} slabErrorsById={slabErrorsById} onChange={setDraft} />

      <SettingsSectionHeading

        title="Variable pay and settlement rules"

        description={VARIABLE_PAY_SETTINGS_NOTICE}

      />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">

        <div className="flex min-w-0 flex-1 flex-col gap-6">

          <OvertimeRulesCard draft={draft} onChange={setDraft} />

          <VariablePayTreatmentCard draft={draft} onChange={setDraft} />

        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">

          <BonusRulesCard draft={draft} onChange={setDraft} />

          <FinalSettlementRulesCard draft={draft} onChange={setDraft} />

        </div>

      </div>

      <SettingsSaveBar

        isDirty={isDirty}

        errors={fieldErrors}

        onSave={onSave}

        onDiscard={discard}

      />

    </div>

  )

}

