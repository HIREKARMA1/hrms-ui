/**

 * Salary structures for employees 7–12 used by the mock payroll service.

 * Component inputs follow settings calculation types per component.

 */



import type { SalaryStructure } from '../types/salaryStructure'



export const mockSalaryStructuresPartB: SalaryStructure[] = [

  {

    id: 'STR-1007',

    employeeId: 'EMP-1007',

    employeeName: 'Meera Iyer',

    department: 'Product',

    componentValues: { basic: 78000, hra: 40, conveyance: 1600, special: 4000, other: 2500 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    effectiveFrom: '2026-04-01',

    revisionCount: 2,

  },

  {

    id: 'STR-1008',

    employeeId: 'EMP-1008',

    employeeName: 'Karan Patel',

    department: 'Finance',

    componentValues: { basic: 62000, hra: 35, conveyance: 1600, special: 2000, other: 1200 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    effectiveFrom: '2026-04-01',

    revisionCount: 1,

  },

  {

    id: 'STR-1009',

    employeeId: 'EMP-1009',

    employeeName: 'Divya Rao',

    department: 'HR',

    componentValues: { basic: 12000, hra: 40, conveyance: 1600, special: 2000, other: 500 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    effectiveFrom: '2026-04-01',

    revisionCount: 2,

  },

  {

    id: 'STR-1010',

    employeeId: 'EMP-1010',

    employeeName: 'Nikhil Verma',

    department: 'Sales & Marketing',

    componentValues: { basic: 54000, hra: 40, conveyance: 1600, special: 5000, other: 6000 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    effectiveFrom: '2026-04-01',

    revisionCount: 1,

  },

  {

    id: 'STR-1011',

    employeeId: 'EMP-1011',

    employeeName: 'Pooja Kulkarni',

    department: 'Engineering',

    componentValues: { basic: 88000, hra: 40, conveyance: 1600, special: 5000, other: 3000 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    effectiveFrom: '2026-04-01',

    revisionCount: 3,

  },

  {

    id: 'STR-1012',

    employeeId: 'EMP-1012',

    employeeName: 'Aditya Ghosh',

    department: 'Product',

    componentValues: { basic: 70000, hra: 38, conveyance: 1600, special: 2500, other: 1800 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    effectiveFrom: '2026-04-01',

    revisionCount: 1,

  },

]


