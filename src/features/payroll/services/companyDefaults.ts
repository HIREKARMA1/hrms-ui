/**
 * Company seed values for payroll settings — confirm with CA before production.
 * Used as initial state in payrollService mock store.
 */

import { SALARY_COMPONENT_LABELS } from '../constants/salaryComponents'
import type { PayrollSettings } from '../types/payrollSettings'

// Statutory values last reviewed 12 Nov 2026, confirm with CA
export const companyDefaultSettings: PayrollSettings = {
  salaryComponents: [
    {
      id: 'basic',
      label: SALARY_COMPONENT_LABELS.basic,
      calculationType: 'fixed',
      defaultValue: 50000,
      includedInPfWages: true,
      includedInEsiWages: true,
      lockedFixed: true,
    },
    {
      id: 'hra',
      label: SALARY_COMPONENT_LABELS.hra,
      calculationType: 'percent_of_basic',
      defaultValue: 40,
      includedInPfWages: false,
      includedInEsiWages: true,
    },
    {
      id: 'conveyance',
      label: SALARY_COMPONENT_LABELS.conveyance,
      calculationType: 'fixed',
      defaultValue: 1600,
      includedInPfWages: false,
      includedInEsiWages: true,
    },
    {
      id: 'special',
      label: SALARY_COMPONENT_LABELS.special,
      calculationType: 'fixed',
      defaultValue: 5000,
      includedInPfWages: false,
      includedInEsiWages: true,
    },
    {
      id: 'other',
      label: SALARY_COMPONENT_LABELS.other,
      calculationType: 'fixed',
      defaultValue: 2000,
      includedInPfWages: false,
      includedInEsiWages: true,
    },
  ],
  pfEnabled: true,
  pfEmployeeRate: 12,
  pfEmployerRate: 12,
  pfApplyCeiling: true,
  pfWageCeiling: 25000,
  esiEnabled: true,
  esiGrossLimit: 21000,
  esiEmployeeRate: 0.75,
  esiEmployerRate: 3.25,
  professionalTaxEnabled: true,
  professionalTaxState: 'Karnataka',
  professionalTaxSlabs: [
    { id: 'pt-1', fromGross: 0, toGross: 24999, monthlyAmount: 0 },
    {
      id: 'pt-2',
      fromGross: 25000,
      toGross: null,
      monthlyAmount: 200,
      februaryAmount: 300,
    },
  ],
  professionalTaxSlabsByState: {
    Karnataka: [
      { id: 'pt-1', fromGross: 0, toGross: 24999, monthlyAmount: 0 },
      {
        id: 'pt-2',
        fromGross: 25000,
        toGross: null,
        monthlyAmount: 200,
        februaryAmount: 300,
      },
    ],
    Maharashtra: [
      { id: 'pt-mh-1', fromGross: 0, toGross: 7499, monthlyAmount: 0 },
      { id: 'pt-mh-2', fromGross: 7500, toGross: 9999, monthlyAmount: 175 },
      { id: 'pt-mh-3', fromGross: 10000, toGross: null, monthlyAmount: 200, februaryAmount: 300 },
    ],
  },
  tdsMode: 'manual_per_employee',
  lossOfPayBasis: 'fixed_30',
  workingDaysPerMonth: 22,
  payDayOfMonth: 5,
  // Sample values, confirm with CA
  overtimeRules: {
    enabled: true,
    rateMultiplier: 2,
    rateBase: 'Basic',
    workingDaysPerMonth: 26,
    hoursPerDay: 8,
    maxHoursPerMonth: null,
  },
  bonusRules: {
    statutoryBonusPercent: 8.33,
    eligibilitySalaryLimit: 21000,
    calculationWageCeiling: 7000,
    bonusWageBase: 'Basic',
  },
  variablePayTreatment: {
    overtime: {
      includedInPfWages: false,
      includedInEsiWages: false,
      includedInProfessionalTaxGross: true,
    },
    bonus: {
      includedInPfWages: false,
      includedInEsiWages: false,
      includedInProfessionalTaxGross: true,
    },
    incentive: {
      includedInPfWages: false,
      includedInEsiWages: false,
      includedInProfessionalTaxGross: true,
    },
  },
  finalSettlementRules: {
    leaveEncashmentRateBase: 'Basic',
    leaveEncashmentDayDivisor: 30,
    noticeRecoveryRateBase: 'Gross',
    noticeRecoveryDayDivisor: 30,
    gratuityEnabled: true,
    gratuityMinYears: 5,
    gratuityDaysPerYear: 15,
    gratuityDayDivisor: 26,
    gratuityMaxAmount: 2000000,
    gratuityWageBase: 'Basic',
  },
}
