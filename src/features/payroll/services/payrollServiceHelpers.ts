/**
 * Shared delay and failure simulation for payroll mock service modules.
 * Used by payrollService and payrollVariablePayService.
 */

let shouldFailNext = false

export function setPayrollServiceFailNext(value: boolean): void {
  shouldFailNext = value
}

export function throwIfPayrollServiceFail(): void {
  if (shouldFailNext) {
    shouldFailNext = false
    throw new Error('Unable to load payroll data. Please try again.')
  }
}

export function delayPayrollService(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
