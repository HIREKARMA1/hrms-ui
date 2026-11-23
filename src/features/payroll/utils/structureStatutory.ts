/**
 * Per-structure statutory overrides (null = use company default from Settings).
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure, StructureStatutoryOverrides } from '../types/salaryStructure'

export const DEFAULT_STRUCTURE_STATUTORY_OVERRIDES: StructureStatutoryOverrides = {
  pfEmployeeRate: null,
  pfEmployerRate: null,
  professionalTaxState: null,
}

export function getStructureStatutoryOverrides(
  structure: SalaryStructure,
): StructureStatutoryOverrides {
  return structure.statutoryOverrides ?? DEFAULT_STRUCTURE_STATUTORY_OVERRIDES
}

export function resolvePfRates(
  settings: PayrollSettings,
  structure: SalaryStructure,
): { employeeRate: number; employerRate: number } {
  const overrides = getStructureStatutoryOverrides(structure)
  return {
    employeeRate: overrides.pfEmployeeRate ?? settings.pfEmployeeRate,
    employerRate: overrides.pfEmployerRate ?? settings.pfEmployerRate,
  }
}

export function resolveProfessionalTaxState(
  settings: PayrollSettings,
  structure: SalaryStructure,
): string {
  const override = getStructureStatutoryOverrides(structure).professionalTaxState
  return override ?? settings.professionalTaxState
}

export function getProfessionalTaxSlabsForState(
  settings: PayrollSettings,
  state: string,
): PayrollSettings['professionalTaxSlabs'] {
  const fromMap = settings.professionalTaxSlabsByState[state]
  if (fromMap && fromMap.length > 0) {
    return fromMap
  }
  if (state === settings.professionalTaxState) {
    return settings.professionalTaxSlabs
  }
  return []
}

export function listConfiguredProfessionalTaxStates(settings: PayrollSettings): string[] {
  return Object.keys(settings.professionalTaxSlabsByState).sort()
}