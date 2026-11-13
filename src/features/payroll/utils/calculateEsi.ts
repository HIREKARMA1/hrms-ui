/**

 * Computes ESI when gross is within the statutory limit and employee opted in.

 * Used by calculatePayroll; skipped when disabled or ineligible.

 */



import type { PayrollSettings } from '../types/payrollSettings'

import type { SalaryStructureFlags } from '../types/salaryStructure'

import type { StructureComponentValues } from '../types/salaryStructure'

import { roundMoney } from './roundMoney'



export function calculateEsi(

  settings: PayrollSettings,

  flags: SalaryStructureFlags,

  fixedGross: number,

  components: StructureComponentValues,

  variableEsiAdd = 0,

): { employeeEsi: number; employerEsi: number; esiApplicable: boolean } {

  const grossForLimit = fixedGross + variableEsiAdd

  if (!settings.esiEnabled || !flags.esiApplicable || grossForLimit > settings.esiGrossLimit) {

    return { employeeEsi: 0, employerEsi: 0, esiApplicable: false }

  }



  let esiWage = 0

  settings.salaryComponents.forEach((component) => {

    if (component.includedInEsiWages) {

      esiWage += components[component.id]

    }

  })

  esiWage += variableEsiAdd



  return {

    employeeEsi: roundMoney((esiWage * settings.esiEmployeeRate) / 100),

    employerEsi: roundMoney((esiWage * settings.esiEmployerRate) / 100),

    esiApplicable: true,

  }

}


