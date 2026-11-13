/**

 * Resolves component amounts from structure values and settings definitions.

 * Used before PF, ESI, and gross totals are computed.

 */



import type { SalaryComponentId } from '../constants/salaryComponents'

import { SALARY_COMPONENT_IDS } from '../constants/salaryComponents'

import type { PayrollSettings } from '../types/payrollSettings'

import type { StructureComponentValues } from '../types/salaryStructure'

import { roundMoney } from './roundMoney'



export function resolveComponentAmounts(

  settings: PayrollSettings,

  componentValues: StructureComponentValues,

): StructureComponentValues {

  const basicDef = settings.salaryComponents.find((item) => item.id === 'basic')

  const basicInput = componentValues.basic

  const basicAmount = roundMoney(

    basicDef?.calculationType === 'percent_of_basic' ? 0 : basicInput,

  )



  const resolved = {} as StructureComponentValues

  SALARY_COMPONENT_IDS.forEach((componentId) => {

    const definition = settings.salaryComponents.find((item) => item.id === componentId)

    const input = componentValues[componentId]

    if (!definition) {

      resolved[componentId] = 0

      return

    }

    if (componentId === 'basic') {

      resolved.basic = basicAmount

      return

    }

    resolved[componentId] =

      definition.calculationType === 'percent_of_basic'

        ? roundMoney((basicAmount * input) / 100)

        : roundMoney(input)

  })



  return resolved

}



export function sumGross(components: StructureComponentValues): number {

  return roundMoney(

    SALARY_COMPONENT_IDS.reduce(

      (total, id) => total + (components[id as SalaryComponentId] ?? 0),

      0,

    ),

  )

}


