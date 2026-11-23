/**

 * Single rounding helper so PF, ESI, and net stay consistent everywhere.

 * Used by all payroll calculation utilities.

 */



export function roundMoney(amount: number): number {

  return Math.round(amount)

}


