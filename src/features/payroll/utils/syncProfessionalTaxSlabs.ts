/**
 * Keeps professionalTaxSlabs in sync with professionalTaxSlabsByState for the active state.
 */

import type { PayrollSettings, ProfessionalTaxSlab } from '../types/payrollSettings'

export function payrollSettingsWithPtSlabs(
  draft: PayrollSettings,
  slabs: ProfessionalTaxSlab[],
): PayrollSettings {
  return {
    ...draft,
    professionalTaxSlabs: slabs,
    professionalTaxSlabsByState: {
      ...draft.professionalTaxSlabsByState,
      [draft.professionalTaxState]: slabs,
    },
  }
}

export function payrollSettingsWithPtState(draft: PayrollSettings, state: string): PayrollSettings {
  const byState = {
    ...draft.professionalTaxSlabsByState,
    [draft.professionalTaxState]: draft.professionalTaxSlabs,
  }
  const slabs = byState[state] ?? []
  return {
    ...draft,
    professionalTaxState: state,
    professionalTaxSlabs: slabs,
    professionalTaxSlabsByState: byState,
  }
}