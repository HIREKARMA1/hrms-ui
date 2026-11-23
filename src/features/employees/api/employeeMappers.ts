/**
 * Mapping between the backend employee contract and the existing frontend
 * `EmployeeProfile` model used by the Employee screens.
 *
 * - Sensitive backend fields (aadhaar, PAN, UAN, bank account) are dropped on
 *   read and never reach the RTK Query cache or the UI.
 * - Frontend-only fields have no backend column. They are reported as
 *   "unsupported" instead of being silently discarded.
 */

import { emptyEmployeeForm } from '../utils/employeeForm'
import { validateEmployeeCreate } from '../validation/employeeForm.schema'
import type {
  EmployeeProfile,
  EmployeeProfileFormState,
  EmploymentStatus,
} from '../types/employeeProfile.types'
import {
  EMPLOYEE_DOCUMENT_FIELDS,
  type AddressInput,
  type BackendAddress,
  type BackendDeviceSyncStatus,
  type BackendDocumentType,
  type BackendEmployee,
  type BackendEmploymentStatus,
  type BackendUserRole,
  type BankDetailInput,
  type EmployeeDocumentField,
  type EmployeePage,
  type UpdateEmployeeBody,
} from './employeeApi.types'

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

const STATUS_TO_FRONTEND: Record<BackendEmploymentStatus, EmploymentStatus> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  PROBATION: 'Probation',
  TERMINATED: 'Terminated',
}

const STATUS_TO_BACKEND: Partial<Record<EmploymentStatus, BackendEmploymentStatus>> = {
  Active: 'ACTIVE',
  'On Leave': 'ON_LEAVE',
  Probation: 'PROBATION',
  Terminated: 'TERMINATED',
}

/** Statuses the backend can store, in display order. */
export const SERVER_EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  'Active',
  'On Leave',
  'Probation',
  'Terminated',
]

export function toFrontendStatus(status: string): EmploymentStatus {
  return STATUS_TO_FRONTEND[status as BackendEmploymentStatus] ?? 'Inactive'
}

/** Backend enum for a UI status, or null when the backend has no equivalent. */
export function toBackendStatus(status: EmploymentStatus): BackendEmploymentStatus | null {
  return STATUS_TO_BACKEND[status] ?? null
}

// ---------------------------------------------------------------------------
// Read mapping
// ---------------------------------------------------------------------------

export type EmployeeServerDocument = {
  id: string
  type: BackendDocumentType
  label: string
  fileName: string
  mimeType: string
  /** Absolute URL on the API origin. */
  url: string
  uploadedAt: string
}

/** Non-sensitive server metadata kept alongside the UI profile. */
export type EmployeeServerInfo = {
  id: string
  employeeCode: string
  role: BackendUserRole
  departmentId: string | null
  deviceId: string | null
  deviceUserId: string | null
  deviceSyncStatus: BackendDeviceSyncStatus
  deviceSyncError: string | null
  deviceSyncedAt: string | null
  hasLoginAccount: boolean
  hasBankDetail: boolean
  permanentAddress: AddressInput | null
  currentAddress: AddressInput | null
  documents: EmployeeServerDocument[]
  createdAt: string
}

export type EmployeeRecord = {
  profile: EmployeeProfile
  server: EmployeeServerInfo
}

/** `YYYY-MM-DD` from a Prisma `@db.Date` ISO string (stored at UTC midnight). */
export function isoToDateInput(value: string | null | undefined): string {
  if (!value) return ''
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : ''
}

function toAddressInput(address: BackendAddress | undefined): AddressInput | null {
  if (!address) return null
  return {
    line1: address.line1,
    line2: address.line2 ?? undefined,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
  }
}

/** Textarea text: line1, then line2 on a new line. */
export function addressToText(address: AddressInput | null): string {
  if (!address) return ''
  return address.line2 ? `${address.line1}\n${address.line2}` : address.line1
}

function splitAddressText(text: string): { line1: string; line2?: string } {
  const [first, ...rest] = text.split('\n')
  const line2 = rest.join(' ').trim()
  return { line1: first.trim(), line2: line2 || undefined }
}

const DOCUMENT_LABELS = Object.fromEntries(
  EMPLOYEE_DOCUMENT_FIELDS.map((item) => [item.type, item.label]),
) as Record<BackendDocumentType, string>

/** Documents are served from the API origin, outside the `/api/v1` prefix. */
export function resolveServerFileUrl(fileUrl: string, apiBaseUrl: string): string {
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl
  try {
    return new URL(fileUrl, new URL(apiBaseUrl).origin).toString()
  } catch {
    return fileUrl
  }
}

export function mapEmployee(employee: BackendEmployee, apiBaseUrl: string): EmployeeRecord {
  const permanent = toAddressInput(employee.addresses?.find((a) => a.type === 'PERMANENT'))
  const current = toAddressInput(employee.addresses?.find((a) => a.type === 'CURRENT'))
  const primary = permanent ?? current
  const blank = emptyEmployeeForm()

  const profile: EmployeeProfile = {
    ...blank,
    // Remaining frontend-only fields have no stored value: show empty, not defaults.
    workLocation: '',
    branch: '',
    workShift: '',
    id: employee.id,
    employeeId: employee.employeeCode,
    employeeCode: employee.employeeCode,
    firstName: employee.firstName,
    lastName: employee.lastName,
    profilePictureName: employee.photoUrl ? employee.photoUrl.split('/').pop() ?? '' : '',
    profilePictureUrl: employee.photoUrl ?? '',
    dateOfBirth: isoToDateInput(employee.dateOfBirth),
    gender: employee.gender ?? '',
    maritalStatus: employee.maritalStatus ?? '',
    nationality: employee.nationality ?? '',
    noticePeriod: employee.noticePeriod ?? '',
    bloodGroup: employee.bloodGroup ?? '',
    personalMobile: employee.phone ?? '',
    currentAddress: addressToText(current),
    permanentAddress: addressToText(permanent),
    city: primary?.city ?? '',
    state: primary?.state ?? '',
    country: primary?.country ?? '',
    pinCode: primary?.pincode ?? '',
    dateOfJoining: isoToDateInput(employee.dateOfJoining),
    department: employee.department?.name ?? '',
    designation: employee.designation ?? '',
    workEmail: employee.email ?? '',
    employmentStatus: toFrontendStatus(employee.employmentStatus),
    activityHistory: [],
  }

  return {
    profile,
    server: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      role: employee.role,
      departmentId: employee.departmentId ?? null,
      deviceId: employee.deviceId ?? null,
      deviceUserId: employee.deviceUserId ?? null,
      deviceSyncStatus: employee.deviceSyncStatus,
      deviceSyncError: employee.deviceSyncError ?? null,
      deviceSyncedAt: employee.deviceSyncedAt ?? null,
      hasLoginAccount: Boolean(employee.user),
      hasBankDetail: Boolean(employee.bankDetail),
      permanentAddress: permanent,
      currentAddress: current,
      documents: (employee.documents ?? []).map((doc) => ({
        id: doc.id,
        type: doc.type,
        label: DOCUMENT_LABELS[doc.type] ?? doc.type,
        fileName: doc.originalName,
        mimeType: doc.mimeType,
        url: resolveServerFileUrl(doc.fileUrl, apiBaseUrl),
        uploadedAt: isoToDateInput(doc.createdAt),
      })),
      createdAt: employee.createdAt,
    },
  }
}

export function mapEmployeePage(
  page: EmployeePage<BackendEmployee>,
  apiBaseUrl: string,
): EmployeePage<EmployeeRecord> {
  const items = Array.isArray(page?.items) ? page.items : []
  return {
    total: typeof page?.total === 'number' ? page.total : items.length,
    skip: typeof page?.skip === 'number' ? page.skip : 0,
    take: typeof page?.take === 'number' ? page.take : items.length,
    items: items.map((item) => mapEmployee(item, apiBaseUrl)),
  }
}

export type PageInfo = {
  from: number
  to: number
  total: number
  hasPrevious: boolean
  hasNext: boolean
}

/** 1-based range for "Showing x–y of total" plus prev/next availability. */
export function getPageInfo(page: Pick<EmployeePage<unknown>, 'total' | 'skip'>, itemCount: number): PageInfo {
  const from = itemCount === 0 ? 0 : page.skip + 1
  const to = page.skip + itemCount
  return {
    from,
    to,
    total: page.total,
    hasPrevious: page.skip > 0,
    hasNext: to < page.total,
  }
}

// ---------------------------------------------------------------------------
// Unsupported (frontend-only) fields
// ---------------------------------------------------------------------------

type FormField = keyof EmployeeProfileFormState

export const PROFILE_FIELD_LABELS: Record<FormField, string> = {
  employeeId: 'Employee ID',
  employeeCode: 'Employee Code',
  firstName: 'First Name',
  middleName: 'Middle Name',
  lastName: 'Last Name',
  profilePictureName: 'Profile Picture',
  profilePictureUrl: 'Profile Picture',
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  maritalStatus: 'Marital Status',
  bloodGroup: 'Blood Group',
  nationality: 'Nationality',
  personalEmail: 'Personal Email',
  personalMobile: 'Mobile Number',
  currentAddress: 'Current Address',
  permanentAddress: 'Permanent Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  pinCode: 'PIN Code',
  emergencyContactPerson: 'Emergency Contact Person',
  emergencyContactNumber: 'Emergency Contact Number',
  emergencyRelationship: 'Emergency Relationship',
  dateOfJoining: 'Date of Joining',
  employmentType: 'Employment Type',
  department: 'Department',
  designation: 'Designation',
  jobRole: 'Job Role',
  reportingManager: 'Reporting Manager',
  teamLeader: 'Team Leader',
  workLocation: 'Work Location',
  branch: 'Branch',
  workEmail: 'Work Email',
  workPhone: 'Work Phone',
  employmentStatus: 'Employment Status',
  probationStartDate: 'Probation Start Date',
  probationEndDate: 'Probation End Date',
  confirmationDate: 'Confirmation Date',
  noticePeriod: 'Notice Period',
  workShift: 'Work Shift',
}

/** No backend column at all (create and update). */
export const FRONTEND_ONLY_FIELDS: readonly FormField[] = [
  'employeeId',
  'middleName',
  'personalEmail',
  'emergencyContactPerson',
  'emergencyContactNumber',
  'emergencyRelationship',
  'employmentType',
  'jobRole',
  'reportingManager',
  'teamLeader',
  'workLocation',
  'branch',
  'workPhone',
  'probationStartDate',
  'probationEndDate',
  'confirmationDate',
  'workShift',
]

/** No backend column on create (department is sent as `departmentId` separately). */
export const CREATE_UNSUPPORTED_FIELDS: ReadonlySet<FormField> = new Set([
  ...FRONTEND_ONLY_FIELDS,
])

/** PATCH /employees/:id has no `designation` or `departmentId`. */
export const UPDATE_UNSUPPORTED_FIELDS: ReadonlySet<FormField> = new Set([
  ...FRONTEND_ONLY_FIELDS,
  'department',
  'designation',
])

export type UnsupportedChange = { field: FormField; label: string }

/** Fields in `unsupported` whose value differs from `baseline` (i.e. user-entered). */
export function getUnsupportedChanges(
  form: EmployeeProfileFormState,
  baseline: EmployeeProfileFormState,
  unsupported: ReadonlySet<FormField>,
): UnsupportedChange[] {
  const changes: UnsupportedChange[] = []
  for (const field of unsupported) {
    if ((form[field] ?? '') !== (baseline[field] ?? '')) {
      changes.push({ field, label: PROFILE_FIELD_LABELS[field] })
    }
  }
  return changes
}

// ---------------------------------------------------------------------------
// Validation (mirrors the backend Zod schemas)
// ---------------------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function buildAddress(
  text: string,
  location: { city: string; state: string; pincode: string; country: string },
): AddressInput {
  const { line1, line2 } = splitAddressText(text)
  return {
    line1,
    ...(line2 ? { line2 } : {}),
    city: location.city.trim(),
    state: location.state.trim(),
    pincode: location.pincode.trim(),
    country: location.country.trim() || 'India',
  }
}

function addressErrors(address: AddressInput, label: string): string[] {
  const errors: string[] = []
  if (!address.line1) errors.push(`${label}: address line is required.`)
  if (!address.city) errors.push(`${label}: city is required.`)
  if (!address.state) errors.push(`${label}: state is required.`)
  if (address.pincode.length < 4) errors.push(`${label}: PIN code is required.`)
  return errors
}

function sharedLocation(form: EmployeeProfileFormState) {
  return { city: form.city, state: form.state, pincode: form.pinCode, country: form.country }
}

// ---------------------------------------------------------------------------
// Update payload (PATCH /employees/:id)
// ---------------------------------------------------------------------------

export type UpdatePayloadResult = {
  body: UpdateEmployeeBody
  errors: string[]
  unsupported: UnsupportedChange[]
}

/**
 * Builds a minimal PATCH body: only backend-supported fields the user changed.
 * Changed frontend-only fields are returned in `unsupported`.
 */
export function buildUpdatePayload(
  form: EmployeeProfileFormState,
  original: EmployeeRecord,
): UpdatePayloadResult {
  const base = toFormState(original.profile)
  const body: UpdateEmployeeBody = {}
  const errors: string[] = []
  const unsupported = getUnsupportedChanges(form, base, UPDATE_UNSUPPORTED_FIELDS)
  const changed = (field: FormField) => (form[field] ?? '') !== (base[field] ?? '')
  const text = (field: FormField) => String(form[field] ?? '').trim()

  if (changed('employeeCode')) {
    if (!text('employeeCode')) errors.push('Employee Code cannot be empty.')
    else body.employeeCode = text('employeeCode')
  }
  if (changed('firstName')) {
    if (!text('firstName')) errors.push('First Name cannot be empty.')
    else body.firstName = text('firstName')
  }
  if (changed('lastName')) {
    if (!text('lastName')) errors.push('Last Name cannot be empty.')
    else body.lastName = text('lastName')
  }
  if (changed('workEmail')) {
    if (!EMAIL_RE.test(text('workEmail'))) errors.push('Work Email must be a valid email.')
    else body.email = text('workEmail')
  }
  if (changed('personalMobile')) {
    if (text('personalMobile').length < 8) errors.push('Mobile Number must have at least 8 characters.')
    else body.phone = text('personalMobile')
  }
  if (changed('bloodGroup')) {
    if (!text('bloodGroup')) errors.push('Blood Group cannot be cleared.')
    else body.bloodGroup = text('bloodGroup')
  }
  for (const field of ['dateOfBirth', 'dateOfJoining'] as const) {
    if (!changed(field)) continue
    if (!DATE_RE.test(text(field))) {
      errors.push(`${PROFILE_FIELD_LABELS[field]} ${text(field) ? 'must be a valid date' : 'cannot be cleared'}.`)
    } else {
      body[field] = text(field)
    }
  }
  if (changed('employmentStatus')) {
    const status = toBackendStatus(form.employmentStatus)
    if (status) body.employmentStatus = status
    else unsupported.push({ field: 'employmentStatus', label: `Employment Status "${form.employmentStatus}"` })
  }
  if (changed('profilePictureUrl')) {
    if (isHttpUrl(text('profilePictureUrl'))) body.photoUrl = text('profilePictureUrl')
    else unsupported.push({ field: 'profilePictureUrl', label: 'Profile Picture (local preview only)' })
  }
  for (const field of ['gender', 'maritalStatus', 'nationality', 'noticePeriod'] as const) {
    if (changed(field)) body[field] = text(field) || undefined
  }

  const locationChanged = (['city', 'state', 'pinCode', 'country'] as const).some(changed)
  if (changed('permanentAddress') || locationChanged) {
    if (!text('permanentAddress')) {
      errors.push('Permanent Address cannot be cleared.')
    } else {
      const address = buildAddress(form.permanentAddress, sharedLocation(form))
      const problems = addressErrors(address, 'Permanent Address')
      if (problems.length) errors.push(...problems)
      else body.permanentAddress = address
    }
  }
  if (changed('currentAddress')) {
    if (!text('currentAddress')) {
      errors.push('Current Address cannot be cleared through the API.')
    } else {
      const existing = original.server.currentAddress
      const location = existing
        ? { city: existing.city, state: existing.state, pincode: existing.pincode, country: existing.country }
        : sharedLocation(form)
      const address = buildAddress(form.currentAddress, location)
      const problems = addressErrors(address, 'Current Address')
      if (problems.length) errors.push(...problems)
      else body.currentAddress = address
    }
  }

  return { body, errors, unsupported }
}

export type EmployeeDeviceLinkFormState = {
  deviceId: string
  deviceUserId: string
}

type EmployeeDeviceLinkOriginal = Pick<EmployeeRecord['server'], 'deviceId' | 'deviceUserId'>

export function deviceLinkFromServer(server: EmployeeDeviceLinkOriginal): EmployeeDeviceLinkFormState {
  return {
    deviceId: server.deviceId ?? '',
    deviceUserId: server.deviceUserId ?? '',
  }
}

export type DeviceLinkUpdateResult = {
  body: Pick<UpdateEmployeeBody, 'deviceId' | 'deviceUserId'>
  errors: string[]
}

/** PATCH /employees/:id — device link only (HR profile biometric tab). */
export function buildDeviceLinkUpdatePayload(
  form: EmployeeDeviceLinkFormState,
  original: EmployeeDeviceLinkOriginal,
): DeviceLinkUpdateResult {
  const errors: string[] = []
  const body: DeviceLinkUpdateResult['body'] = {}
  const trim = (value: string) => value.trim()
  const nextDeviceId = trim(form.deviceId)
  const nextDeviceUserId = trim(form.deviceUserId)
  const prevDeviceId = original.deviceId ?? ''
  const prevDeviceUserId = original.deviceUserId ?? ''

  const deviceIdChanged = nextDeviceId !== prevDeviceId
  const deviceUserIdChanged = nextDeviceUserId !== prevDeviceUserId

  if (!deviceIdChanged && !deviceUserIdChanged) {
    return { body, errors }
  }

  const effectiveDeviceId = deviceIdChanged ? nextDeviceId : prevDeviceId
  if (!effectiveDeviceId && (deviceIdChanged || deviceUserIdChanged)) {
    errors.push('Biometric device ID is required when linking.')
    return { body, errors }
  }

  if (deviceIdChanged) {
    if (!nextDeviceId) {
      errors.push('Biometric device ID cannot be cleared from the profile.')
    } else {
      body.deviceId = nextDeviceId
    }
  }

  if (deviceUserIdChanged) {
    body.deviceUserId = nextDeviceUserId || null
  }

  return { body, errors }
}

export function toFormState(profile: EmployeeProfile): EmployeeProfileFormState {
  const { id: _id, activityHistory: _history, ...rest } = profile
  void _id
  void _history
  return rest
}

// ---------------------------------------------------------------------------
// Create payload (POST /employees, multipart)
// ---------------------------------------------------------------------------

/** Create-only inputs the backend requires that the shared form does not have. */
export type EmployeeCreateExtras = {
  role: BackendUserRole
  aadhaar: string
  pan: string
  uanNumber: string
  deviceId: string
  deviceUserId: string
  /** Optional department cuid from GET /departments. */
  departmentId: string
  /** Used when the profile picture is not already an http(s) URL. */
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

export function emptyCreateExtras(): EmployeeCreateExtras {
  return {
    role: 'EMPLOYEE',
    aadhaar: '',
    pan: '',
    uanNumber: '',
    deviceId: '',
    deviceUserId: '',
    departmentId: '',
    photoUrl: '',
    bankDetail: { accountHolderName: '', accountNumber: '', ifsc: '', bankName: '', branch: '' },
    documents: {},
  }
}

export type CreatePayloadResult = {
  formData: FormData | null
  errors: string[]
  unsupported: UnsupportedChange[]
}

function fileName(file: File | Blob, fallback: string): string {
  return 'name' in file && typeof file.name === 'string' && file.name ? file.name : fallback
}

export function buildCreateFormData(
  form: EmployeeProfileFormState,
  extras: EmployeeCreateExtras,
): CreatePayloadResult {
  const blank = Object.fromEntries(
    Object.keys(form).map((key) => [key, '']),
  ) as unknown as EmployeeProfileFormState
  const unsupported = getUnsupportedChanges(form, blank, CREATE_UNSUPPORTED_FIELDS)
  const validation = validateEmployeeCreate(form, extras)
  if (!validation.ok) {
    return { formData: null, errors: validation.errors, unsupported }
  }

  const t = (value: string) => value.trim()
  const status = toBackendStatus(form.employmentStatus)
  if (!status) {
    return {
      formData: null,
      errors: [`Employment Status "${form.employmentStatus}" cannot be stored by the server.`],
      unsupported,
    }
  }

  const photoUrl = isHttpUrl(t(form.profilePictureUrl)) ? t(form.profilePictureUrl) : t(extras.photoUrl)
  const permanent = buildAddress(form.permanentAddress, sharedLocation(form))
  const current = t(form.currentAddress) ? buildAddress(form.currentAddress, sharedLocation(form)) : null
  const bank = extras.bankDetail

  const bankDetail: BankDetailInput = {
    accountHolderName: t(bank.accountHolderName),
    accountNumber: t(bank.accountNumber),
    ifsc: t(bank.ifsc).toUpperCase(),
    bankName: t(bank.bankName),
    ...(t(bank.branch) ? { branch: t(bank.branch) } : {}),
  }

  const data = new FormData()
  const append = (key: string, value: string) => {
    if (value) data.append(key, value)
  }
  append('employeeCode', t(form.employeeCode))
  append('firstName', t(form.firstName))
  append('lastName', t(form.lastName))
  append('designation', t(form.designation))
  append('employmentStatus', status)
  append('role', extras.role)
  append('email', t(form.workEmail))
  append('phone', t(form.personalMobile))
  append('aadhaar', t(extras.aadhaar))
  append('pan', t(extras.pan).toUpperCase())
  append('bloodGroup', t(form.bloodGroup))
  append('photoUrl', photoUrl)
  append('dateOfJoining', t(form.dateOfJoining))
  append('dateOfBirth', t(form.dateOfBirth))
  append('gender', t(form.gender))
  append('maritalStatus', t(form.maritalStatus))
  append('nationality', t(form.nationality))
  append('noticePeriod', t(form.noticePeriod))
  append('uanNumber', t(extras.uanNumber))
  append('departmentId', t(extras.departmentId))
  append('deviceId', t(extras.deviceId))
  append('deviceUserId', t(extras.deviceUserId))
  data.append('permanentAddress', JSON.stringify(permanent))
  if (current) data.append('currentAddress', JSON.stringify(current))
  data.append('bankDetail', JSON.stringify(bankDetail))
  for (const { field } of EMPLOYEE_DOCUMENT_FIELDS) {
    const file = extras.documents[field]
    if (file) data.append(field, file, fileName(file, field))
  }

  return { formData: data, errors: [], unsupported }
}
