import { z } from 'zod'

import {
  EMPLOYEE_DOCUMENT_FIELDS,
  EMPLOYEE_DOCUMENT_MAX_BYTES,
  type BackendUserRole,
  type EmployeeDocumentField,
} from '../api/employeeApi.types'
import type { EmployeeProfileFormState, EmploymentStatus } from '../types/employeeProfile.types'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const AADHAAR_RE = /^\d{12}$/
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/i
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/i
const DOC_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])

const SERVER_STATUSES = new Set<EmploymentStatus>([
  'Active',
  'On Leave',
  'Probation',
  'Terminated',
])

const requiredTrimmed = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)

const optionalDate = z
  .string()
  .trim()
  .refine((value) => !value || DATE_RE.test(value), 'Date of Birth must be a valid date.')

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Create-only extras validated alongside the profile form. */
export type EmployeeCreateValidationExtras = {
  role: BackendUserRole
  aadhaar: string
  pan: string
  uanNumber: string
  deviceId: string
  deviceUserId: string
  departmentId: string
  photoUrl: string
  bankDetail: {
    accountHolderName: string
    accountNumber: string
    ifsc: string
    bankName: string
    branch: string
  }
  documents: Partial<Record<EmployeeDocumentField, File | Blob | null>>
}

/** Profile fields required by POST /employees. */
export const employeeCreateProfileSchema = z.object({
  employeeCode: requiredTrimmed('Employee Code'),
  firstName: requiredTrimmed('First Name'),
  lastName: requiredTrimmed('Last Name'),
  bloodGroup: requiredTrimmed('Blood Group'),
  personalMobile: z
    .string()
    .trim()
    .min(8, 'Mobile Number must have at least 8 characters.'),
  permanentAddress: requiredTrimmed('Permanent Address'),
  city: requiredTrimmed('City'),
  state: requiredTrimmed('State'),
  country: requiredTrimmed('Country'),
  pinCode: z.string().trim().min(4, 'PIN code is required.'),
  dateOfJoining: z
    .string()
    .trim()
    .regex(DATE_RE, 'Date of Joining is required.'),
  designation: requiredTrimmed('Designation'),
  workEmail: z.string().trim().email('Work Email must be a valid email.'),
  employmentStatus: z.string().trim().min(1, 'Employment Status is required.'),
  dateOfBirth: optionalDate,
  currentAddress: z.string().optional(),
})

/** KYC / bank / device fields required by POST /employees. */
export const employeeCreateExtrasSchema = z.object({
  role: z.enum(['EMPLOYEE', 'HR_ADMIN', 'MANAGER', 'SUPER_ADMIN']),
  aadhaar: z.string().trim().regex(AADHAAR_RE, 'Aadhaar must be 12 digits.'),
  pan: z.string().trim().regex(PAN_RE, 'PAN must look like ABCDE1234F.'),
  deviceId: requiredTrimmed('Device ID'),
  uanNumber: z.string().optional(),
  deviceUserId: z.string().optional(),
  departmentId: z.string().optional(),
  photoUrl: z.string().optional(),
  bankDetail: z.object({
    accountHolderName: requiredTrimmed('Account holder name'),
    accountNumber: z.string().trim().min(5, 'Account number is required.'),
    ifsc: z.string().trim().regex(IFSC_RE, 'IFSC must look like SBIN0001234.'),
    bankName: requiredTrimmed('Bank name'),
    branch: z.string().optional(),
  }),
})

/** Field names that must show a required asterisk on the registration form. */
export const CREATE_REQUIRED_PROFILE_FIELDS = new Set<keyof EmployeeProfileFormState>([
  'employeeCode',
  'firstName',
  'lastName',
  'bloodGroup',
  'personalMobile',
  'permanentAddress',
  'city',
  'state',
  'country',
  'pinCode',
  'dateOfJoining',
  'designation',
  'workEmail',
  'employmentStatus',
  'profilePictureUrl',
])

/** Profile fields that must remain filled when editing an existing employee. */
export const UPDATE_REQUIRED_PROFILE_FIELDS = new Set<keyof EmployeeProfileFormState>([
  'employeeCode',
  'firstName',
  'lastName',
  'bloodGroup',
  'personalMobile',
  'permanentAddress',
  'city',
  'state',
  'country',
  'pinCode',
  'dateOfJoining',
  'workEmail',
  'employmentStatus',
])

export type FormValidationResult =
  | { ok: true; errors: [] }
  | { ok: false; errors: string[] }

function flattenZodErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message)
}

/** Validates registration form + create-only extras before save is allowed. */
export function validateEmployeeCreate(
  form: EmployeeProfileFormState,
  extras: EmployeeCreateValidationExtras,
): FormValidationResult {
  const errors: string[] = []

  const profile = employeeCreateProfileSchema.safeParse(form)
  if (!profile.success) errors.push(...flattenZodErrors(profile.error))

  const extrasResult = employeeCreateExtrasSchema.safeParse(extras)
  if (!extrasResult.success) errors.push(...flattenZodErrors(extrasResult.error))

  if (!SERVER_STATUSES.has(form.employmentStatus)) {
    errors.push(`Employment Status "${form.employmentStatus}" cannot be stored by the server.`)
  }

  if (!isHttpUrl(form.profilePictureUrl.trim())) {
    errors.push('Profile Photo is required. Upload a photo first.')
  }

  for (const { field, label } of EMPLOYEE_DOCUMENT_FIELDS) {
    const file = extras.documents[field]
    if (!file) continue
    if (!DOC_MIME.has(file.type)) {
      errors.push(`${label} must be a PDF, JPEG, PNG or WebP file.`)
    }
    if (file.size > EMPLOYEE_DOCUMENT_MAX_BYTES) {
      errors.push(`${label} exceeds 10MB.`)
    }
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, errors: [] }
}

/** Profile fields that must stay valid when saving an existing employee. */
export const employeeUpdateProfileSchema = z.object({
  employeeCode: requiredTrimmed('Employee Code'),
  firstName: requiredTrimmed('First Name'),
  lastName: requiredTrimmed('Last Name'),
  bloodGroup: requiredTrimmed('Blood Group'),
  personalMobile: z
    .string()
    .trim()
    .min(8, 'Mobile Number must have at least 8 characters.'),
  permanentAddress: requiredTrimmed('Permanent Address'),
  city: requiredTrimmed('City'),
  state: requiredTrimmed('State'),
  country: requiredTrimmed('Country'),
  pinCode: z.string().trim().min(4, 'PIN code is required.'),
  dateOfJoining: z
    .string()
    .trim()
    .regex(DATE_RE, 'Date of Joining is required.'),
  workEmail: z.string().trim().email('Work Email must be a valid email.'),
  employmentStatus: z.string().trim().min(1, 'Employment Status is required.'),
  dateOfBirth: optionalDate,
})

export function validateEmployeeUpdate(form: EmployeeProfileFormState): FormValidationResult {
  const result = employeeUpdateProfileSchema.safeParse(form)
  if (!result.success) return { ok: false, errors: flattenZodErrors(result.error) }
  if (!SERVER_STATUSES.has(form.employmentStatus)) {
    return {
      ok: false,
      errors: [`Employment Status "${form.employmentStatus}" cannot be stored by the server.`],
    }
  }
  return { ok: true, errors: [] }
}
