/**
 * Renders existing settings cards for the active Payroll Settings section.
 */

import type { PayrollSettings } from '../../types/payrollSettings'
import type { PayrollSettingsSectionId } from '../../constants/payrollSettingsSections'
import { EsiSettingsCard } from './EsiSettingsCard'
import { FinalSettlementRulesCard } from './FinalSettlementRulesCard'
import { PayrollCycleCard } from './PayrollCycleCard'
import { PfSettingsCard } from './PfSettingsCard'
import { ProfessionalTaxCard } from './ProfessionalTaxCard'
import { SalaryComponentsCard } from './SalaryComponentsCard'
import { VariablePayPolicySettingsSection } from './VariablePayPolicySettingsSection'

type PayrollSettingsSectionPanelProps = {
  sectionId: PayrollSettingsSectionId
  draft: PayrollSettings
  slabErrorsById: Record<string, string>
  onChange: (next: PayrollSettings) => void
}

export function PayrollSettingsSectionPanel({
  sectionId,
  draft,
  slabErrorsById,
  onChange,
}: PayrollSettingsSectionPanelProps) {
  switch (sectionId) {
    case 'pay-cycle':
      return <PayrollCycleCard draft={draft} onChange={onChange} />
    case 'pay-components':
      return <SalaryComponentsCard draft={draft} onChange={onChange} />
    case 'pf-esi':
      return (
        <>
          <PfSettingsCard draft={draft} onChange={onChange} />
          <EsiSettingsCard draft={draft} onChange={onChange} />
        </>
      )
    case 'professional-tax':
      return <ProfessionalTaxCard draft={draft} slabErrorsById={slabErrorsById} onChange={onChange} />
    case 'variable-pay':
      return <VariablePayPolicySettingsSection draft={draft} onChange={onChange} />
    case 'exit-settlement':
      return <FinalSettlementRulesCard draft={draft} onChange={onChange} />
    default:
      return null
  }
}