/**

 * Append-only mock salary revision history per employee.

 * Used by getRevisions in payrollService and Structures panel.

 */



import { MOCK_REVISION_AUTHOR } from '../constants/payrollRules'

import type { SalaryRevision } from '../types/salaryStructure'



export const mockSalaryRevisions: SalaryRevision[] = [

  {

    id: 'REV-1001-2',

    employeeId: 'EMP-1001',

    effectiveFrom: '2026-04-01',

    previousStructure: { basic: 80000, hra: 40, conveyance: 1600, special: 4500, other: 2500 },

    newStructure: { basic: 85000, hra: 40, conveyance: 1600, special: 5000, other: 3000 },

    previousGross: 118100,

    newGross: 125100,

    reason: 'Annual increment',

    changedBy: MOCK_REVISION_AUTHOR,

    changedAt: '2026-03-28',

  },

  {

    id: 'REV-1003-3',

    employeeId: 'EMP-1003',

    effectiveFrom: '2026-01-01',

    previousStructure: { basic: 52000, hra: 35, conveyance: 1600, special: 2000, other: 1000 },

    newStructure: { basic: 55000, hra: 35, conveyance: 1600, special: 2500, other: 1500 },

    previousGross: 76900,

    newGross: 81325,

    reason: 'Promotion to HRBP',

    changedBy: MOCK_REVISION_AUTHOR,

    changedAt: '2025-12-20',

  },

  {

    id: 'REV-1009-2',

    employeeId: 'EMP-1009',

    effectiveFrom: '2026-04-01',

    previousStructure: { basic: 11000, hra: 40, conveyance: 1600, special: 1500, other: 400 },

    newStructure: { basic: 12000, hra: 40, conveyance: 1600, special: 2000, other: 500 },

    previousGross: 18600,

    newGross: 20200,

    reason: 'Mid-year adjustment',

    changedBy: MOCK_REVISION_AUTHOR,

    changedAt: '2026-03-15',

  },

]


