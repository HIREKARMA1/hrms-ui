/**

 * Computes employee and employer PF from settings and resolved components.

 * Used by calculatePayroll; ceiling limits wage base when enabled.

 */



import type { PayrollSettings } from '../types/payrollSettings'

import type { SalaryStructure } from '../types/salaryStructure'

import type { StructureComponentValues } from '../types/salaryStructure'

import { resolvePfRates } from './structureStatutory'

import { roundMoney } from './roundMoney'



export function calculatePf(

  settings: PayrollSettings,

  structure: SalaryStructure,

  components: StructureComponentValues,

  variablePfAdd = 0,

): { employeePf: number; employerPf: number } {

  if (!settings.pfEnabled || !structure.flags.pfApplicable) {

    return { employeePf: 0, employerPf: 0 }

  }

  const { employeeRate, employerRate } = resolvePfRates(settings, structure)



  let pfWage = 0

  settings.salaryComponents.forEach((component) => {

    if (component.includedInPfWages) {

      pfWage += components[component.id]

    }

  })



  // Wage ceiling keeps high earners aligned with statutory PF caps.

  pfWage += variablePfAdd

  if (settings.pfApplyCeiling) {

    pfWage = Math.min(pfWage, settings.pfWageCeiling)

  }



  return {

    employeePf: roundMoney((pfWage * employeeRate) / 100),

    employerPf: roundMoney((pfWage * employerRate) / 100),

  }

}


