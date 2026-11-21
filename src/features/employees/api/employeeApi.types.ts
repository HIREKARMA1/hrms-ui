/**
 * Backend employee contract, transcribed from hrms-server source
 * (employees.controller.ts, dto/*.schema.ts, employees.service.ts,
 * prisma/schema.prisma). Prisma DateTime fields arrive as ISO strings.
 *
 * Employee endpoints are NOT wrapped in the `{ success, message, data }`
 * envelope (the service returns the object directly and there is no global
 * interceptor). Only `/dashboard/summary` and `/employees/:id/personal-info`
 * use the envelope.
 */

export type BackendEmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED'

export type BackendUserRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'

export type BackendDeviceSyncStatus = 'PENDING' | 'SYNCED' | 'FAILED' | 'NOT_REQUIRED'

export type BackendDocumentType =
  | 'TENTH'
  | 'TWELFTH'
  | 'GRADUATION'
  | 'CERTIFICATE'
  | 'RELIEVING'
  | 'EXPERIENCE'
  | 'SALARY_SLIP'

export interface BackendAddress {
  id: string
  type: 'PERMANENT' | 'CURRENT'
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  country: string
}

export interface BackendBankDetail {
  id: string
  accountHolderName: string
  accountNumber: string
  ifsc: string
  bankName: string
  branch: string | null
}

export interface BackendEmployeeDocument {
  id: string
  type: BackendDocumentType
  /** Server-relative path, served from the API origin (e.g. `/uploads/employees/...`). */
  fileUrl: string
  originalName: string
  mimeType: string
  createdAt: string
}

export interface BackendDepartment {
  id: string
  code: string
  name: string
}

/** `employeeInclude` shape returned by list / search / get / update / sync. */
export interface BackendEmployee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  designation: string
  email: string
  phone: string
  aadhaar: string
  pan: string
  bloodGroup: string
  photoUrl: string
  dateOfBirth: string | null
  uanNumber: string | null
  dateOfJoining: string
  employmentStatus: BackendEmploymentStatus
  role: BackendUserRole
  departmentId: string | null
  deviceId: string | null
  deviceUserId: string | null
  deviceSyncStatus: BackendDeviceSyncStatus
  deviceSyncError: string | null
  deviceSyncedAt: string | null
  createdAt: string
  updatedAt: string
  bankDetail: BackendBankDetail | null
  addresses: BackendAddress[]
  documents: BackendEmployeeDocument[]
  department: BackendDepartment | null
  user: { id: string; email: string; role: BackendUserRole; isActive: boolean } | null
}

/** GET /employees and GET /employees/search. */
export interface EmployeePage<T> {
  total: number
  skip: number
  take: number
  items: T[]
}

export interface DeviceSyncOutcome {
  status: 'success' | 'failed' | 'skipped'
  message: string
  mode?: 'push' | 'link'
  verify?: boolean
}

/** POST /employees, POST /employees/:id/sync-device and PATCH when device fields change. */
export interface BackendEmployeeWithSync {
  employee: BackendEmployee
  sync: {
    database: { status: 'success'; message?: string }
    device: DeviceSyncOutcome
  }
}

/** DELETE /employees/:id. */
export interface BackendDeleteEmployeeResult {
  employee: Pick<
    BackendEmployee,
    'id' | 'employeeCode' | 'firstName' | 'lastName' | 'designation' | 'email'
  >
  sync: {
    database: { status: 'success'; message?: string }
    device: DeviceSyncOutcome
  }
}

/** Address object accepted by PATCH /employees/:id (JSON-encoded on create). */
export interface AddressInput {
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface BankDetailInput {
  accountHolderName: string
  accountNumber: string
  ifsc: string
  bankName: string
  branch?: string
}

/** PATCH /employees/:id body (all optional; at least one required by the server). */
export interface UpdateEmployeeBody {
  employeeCode?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  bloodGroup?: string
  employmentStatus?: BackendEmploymentStatus
  photoUrl?: string
  dateOfBirth?: string
  dateOfJoining?: string
  permanentAddress?: AddressInput
  currentAddress?: AddressInput
  /** TimeWatch device code (PATCH when linking an existing employee). */
  deviceId?: string
  deviceUserId?: string | null
}

/** `data` of GET /dashboard/summary (enveloped). */
export interface EmployeeSummary {
  totalEmployees: number
  activeEmployees: number
  /** TERMINATED. */
  inactiveEmployees: number
  onLeaveEmployees: number
  probationEmployees: number
}

/** Multipart file fields accepted by POST /employees. */
export const EMPLOYEE_DOCUMENT_FIELDS = [
  { field: 'tenth', type: 'TENTH', label: '10th marksheet' },
  { field: 'twelfth', type: 'TWELFTH', label: '12th marksheet' },
  { field: 'graduation', type: 'GRADUATION', label: 'Graduation certificate' },
  { field: 'certificate', type: 'CERTIFICATE', label: 'Other certificate' },
  { field: 'relieving', type: 'RELIEVING', label: 'Relieving letter' },
  { field: 'experience', type: 'EXPERIENCE', label: 'Experience letter' },
  { field: 'salarySlip', type: 'SALARY_SLIP', label: 'Salary slip' },
] as const satisfies ReadonlyArray<{ field: string; type: BackendDocumentType; label: string }>

export type EmployeeDocumentField = (typeof EMPLOYEE_DOCUMENT_FIELDS)[number]['field']

/** EmployeesStorage.saveDocument limits. */
export const EMPLOYEE_DOCUMENT_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const
export const EMPLOYEE_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024
