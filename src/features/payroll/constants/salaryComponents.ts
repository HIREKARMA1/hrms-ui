/**

 * Fixed salary component identifiers for a single company payroll.

 * Used by settings, structures, and calculation utilities.

 */



export const SALARY_COMPONENT_IDS = [

  'basic',

  'hra',

  'conveyance',

  'special',

  'other',

] as const



export type SalaryComponentId = (typeof SALARY_COMPONENT_IDS)[number]



export const SALARY_COMPONENT_LABELS: Record<SalaryComponentId, string> = {

  basic: 'Basic',

  hra: 'HRA',

  conveyance: 'Conveyance allowance',

  special: 'Special allowance',

  other: 'Other allowances',

}


