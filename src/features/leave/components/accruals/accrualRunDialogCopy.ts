export type AccrualPendingRun = 'accrual' | 'carryForward' | 'expire'

export function accrualRunDialogCopy(
  run: AccrualPendingRun,
  asOfDate: string,
  fromYear: number,
  expireYear: number,
): { title: string; description: string; label: string } {
  if (run === 'accrual') {
    return {
      title: 'Run accrual?',
      description: `Posts accrual credits as of ${asOfDate} for every eligible employee under the active accrual policies.`,
      label: 'Run accrual',
    }
  }
  if (run === 'carryForward') {
    return {
      title: 'Run carry-forward?',
      description: `Carries unused ${fromYear} balances into ${fromYear + 1} under the carry-forward policies.`,
      label: 'Run carry-forward',
    }
  }
  return {
    title: 'Expire carried-forward leave?',
    description: `Expires carried-forward days in ${expireYear} that are past their policy expiry.`,
    label: 'Expire',
  }
}