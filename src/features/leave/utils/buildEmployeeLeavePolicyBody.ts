import { isDateOnly } from '../api/leaveMappers'
import type { BackendGrantMode } from '../api/leaveApi.types'
import type {
  AssignEmployeeLeaveDefaultsBody,
  AssignEmployeeLeavePolicyBody,
} from '../types/api/employeeLeavePolicyMutations.types'

const GRANT_MODES: BackendGrantMode[] = ['MONTHLY_ACCRUAL', 'ANNUAL_GRANT']

/** Default policy start when HR assigns entitlement for a calendar year. */
export function defaultEmployeeLeavePolicyEffectiveFrom(year: number): string {
  return `${year}-01-01`
}

export type AssignPolicyInput = {
  employeeId: string
  leaveTypeId: string
  year: number
  useCompanyDefaults: boolean
  grantMode: BackendGrantMode
  annualEntitlement: string
  monthlyAccrualAmount: string
  notes: string
  effectiveFrom: string
  effectiveTo: string
}

export type AssignDefaultsInput = {
  employeeId: string
  year: number
}

export type AssignPolicyBodyResult =
  | { ok: true; body: AssignEmployeeLeavePolicyBody }
  | { ok: false; error: string }

function withEffectiveDates(
  body: AssignEmployeeLeavePolicyBody,
  effectiveFrom: string,
  effectiveTo: string,
): AssignPolicyBodyResult {
  const from = effectiveFrom.trim()
  if (!isDateOnly(from)) {
    return { ok: false, error: 'Effective from is required (YYYY-MM-DD).' }
  }
  body.effectiveFrom = from
  const to = effectiveTo.trim()
  if (to) {
    if (!isDateOnly(to)) return { ok: false, error: 'Effective to must be a valid date (YYYY-MM-DD).' }
    if (to < from) return { ok: false, error: 'Effective to must be on or after effective from.' }
    body.effectiveTo = to
  }
  return { ok: true, body }
}

export function buildAssignEmployeeLeavePolicyBody(input: AssignPolicyInput): AssignPolicyBodyResult {
  if (!input.employeeId.trim()) return { ok: false, error: 'Employee is required.' }
  if (!input.leaveTypeId.trim()) return { ok: false, error: 'Select a leave type.' }
  if (!Number.isInteger(input.year) || input.year < 2000 || input.year > 2100) {
    return { ok: false, error: 'Year must be between 2000 and 2100.' }
  }

  if (input.useCompanyDefaults) {
    return withEffectiveDates(
      {
        employeeId: input.employeeId,
        leaveTypeId: input.leaveTypeId,
        year: input.year,
        useCompanyDefaults: true,
        isActive: true,
      },
      input.effectiveFrom,
      input.effectiveTo,
    )
  }

  if (!GRANT_MODES.includes(input.grantMode)) {
    return { ok: false, error: 'Select a grant mode.' }
  }

  const annual = input.annualEntitlement.trim() === '' ? Number.NaN : Number(input.annualEntitlement)
  const monthly =
    input.monthlyAccrualAmount.trim() === '' ? Number.NaN : Number(input.monthlyAccrualAmount)
  if (!Number.isFinite(annual) || annual < 0) {
    return { ok: false, error: 'Enter a valid annual entitlement (0 or more days).' }
  }
  if (!Number.isFinite(monthly) || monthly < 0) {
    return { ok: false, error: 'Enter a valid monthly accrual (0 or more days).' }
  }

  const notes = input.notes.trim()
  if (notes.length > 1000) return { ok: false, error: 'Notes must be 1000 characters or fewer.' }

  const body: AssignEmployeeLeavePolicyBody = {
    employeeId: input.employeeId,
    leaveTypeId: input.leaveTypeId,
    year: input.year,
    useCompanyDefaults: false,
    grantMode: input.grantMode,
    annualEntitlement: annual,
    monthlyAccrualAmount: monthly,
    isActive: true,
  }
  if (notes) body.notes = notes
  return withEffectiveDates(body, input.effectiveFrom, input.effectiveTo)
}

export function buildAssignEmployeeLeaveDefaultsBody(
  input: AssignDefaultsInput,
): { ok: true; body: AssignEmployeeLeaveDefaultsBody } | { ok: false; error: string } {
  if (!input.employeeId.trim()) return { ok: false, error: 'Employee is required.' }
  if (!Number.isInteger(input.year) || input.year < 2000 || input.year > 2100) {
    return { ok: false, error: 'Year must be between 2000 and 2100.' }
  }
  return { ok: true, body: { employeeId: input.employeeId, year: input.year } }
}