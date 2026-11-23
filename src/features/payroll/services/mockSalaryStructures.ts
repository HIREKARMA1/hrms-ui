/**

 * Aggregates all mock salary structures for payrollService.

 * Used when seeding the in-memory payroll mock store.

 */



import { mockSalaryStructuresPartA } from './mockSalaryStructuresPartA'

import { mockSalaryStructuresPartB } from './mockSalaryStructuresPartB'



export const mockSalaryStructures = [

  ...mockSalaryStructuresPartA,

  ...mockSalaryStructuresPartB,

]


