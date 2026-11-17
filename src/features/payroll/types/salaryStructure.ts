/**

 * Salary structure and revision types for the Structures tab.

 * Used by payrollService, structure editor, and revision history UI.

 */



import type { Department } from './payroll'

import type { SalaryComponentId } from '../constants/salaryComponents'



export type StructureComponentValues = Record<SalaryComponentId, number>



export type SalaryStructureFlags = {

  pfApplicable: boolean

  esiApplicable: boolean

  professionalTaxApplicable: boolean

}



/** null fields fall back to company defaults in Payroll Settings. */

export type StructureStatutoryOverrides = {

  pfEmployeeRate: number | null

  pfEmployerRate: number | null

  professionalTaxState: string | null

}



export type SalaryStructure = {

  id: string

  employeeId: string

  employeeName: string

  department: Department

  componentValues: StructureComponentValues

  flags: SalaryStructureFlags

  statutoryOverrides?: StructureStatutoryOverrides

  effectiveFrom: string

  revisionCount: number

}



export type SalaryRevision = {

  id: string

  employeeId: string

  effectiveFrom: string

  previousStructure: StructureComponentValues

  newStructure: StructureComponentValues

  previousGross: number

  newGross: number

  reason: string

  changedBy: string

  changedAt: string

}


