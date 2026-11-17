/**

 * Salary structures for employees 1–6 used by the mock payroll service.

 * Component inputs follow settings calculation types per component.

 */



import type { SalaryStructure } from '../types/salaryStructure'



export const mockSalaryStructuresPartA: SalaryStructure[] = [

  {

    id: 'STR-1001',

    employeeId: 'EMP-1001',

    employeeName: 'Ananya Sharma',

    department: 'Engineering',

    componentValues: { basic: 85000, hra: 40, conveyance: 1600, special: 5000, other: 3000 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    statutoryOverrides: {
      pfEmployeeRate: 4,
      pfEmployerRate: null,
      professionalTaxState: null,
    },

    effectiveFrom: '2026-04-01',

    revisionCount: 2,

  },

  {

    id: 'STR-1002',

    employeeId: 'EMP-1002',

    employeeName: 'Rahul Mehta',

    department: 'Product',

    componentValues: { basic: 72000, hra: 40, conveyance: 1600, special: 3500, other: 2000 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    statutoryOverrides: {
      pfEmployeeRate: 9,
      pfEmployerRate: null,
      professionalTaxState: null,
    },

    effectiveFrom: '2026-04-01',

    revisionCount: 1,

  },

  {

    id: 'STR-1003',

    employeeId: 'EMP-1003',

    employeeName: 'Priya Nair',

    department: 'HR',

    componentValues: { basic: 55000, hra: 35, conveyance: 1600, special: 2500, other: 1500 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    statutoryOverrides: {
      pfEmployeeRate: null,
      pfEmployerRate: null,
      professionalTaxState: 'Maharashtra',
    },

    effectiveFrom: '2026-01-01',

    revisionCount: 3,

  },

  {

    id: 'STR-1004',

    employeeId: 'EMP-1004',

    employeeName: 'Vikram Singh',

    department: 'Finance',

    componentValues: { basic: 68000, hra: 38, conveyance: 1600, special: 3000, other: 1500 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    effectiveFrom: '2026-04-01',

    revisionCount: 1,

  },

  {

    id: 'STR-1005',

    employeeId: 'EMP-1005',

    employeeName: 'Sneha Reddy',

    department: 'Sales & Marketing',

    componentValues: { basic: 60000, hra: 40, conveyance: 1600, special: 4500, other: 3500 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    effectiveFrom: '2026-04-01',

    revisionCount: 2,

  },

  {

    id: 'STR-1006',

    employeeId: 'EMP-1006',

    employeeName: 'Arjun Das',

    department: 'Engineering',

    componentValues: { basic: 95000, hra: 40, conveyance: 1600, special: 6000, other: 4000 },

    flags: { pfApplicable: true, esiApplicable: true, professionalTaxApplicable: true },

    effectiveFrom: '2026-04-01',

    revisionCount: 1,

  },

]


