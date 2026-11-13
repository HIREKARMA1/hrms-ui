/**

 * Resolves the divisor for loss-of-pay based on company settings.

 * Used by calculatePayroll when unpaid leave days are present.

 */



import type { PayrollSettings } from '../types/payrollSettings'



export function getLossOfPayDivisor(

  settings: PayrollSettings,

  calendarDaysInMonth = 30,

): number {

  if (settings.lossOfPayBasis === 'fixed_30') {

    return 30

  }

  if (settings.lossOfPayBasis === 'working_days') {

    return settings.workingDaysPerMonth

  }

  return calendarDaysInMonth

}


