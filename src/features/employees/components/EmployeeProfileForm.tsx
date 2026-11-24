import type { ReactNode } from 'react'

import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { SERVER_EMPLOYMENT_STATUSES } from '../api/employeeMappers'
import {
  CREATE_REQUIRED_PROFILE_FIELDS,
  UPDATE_REQUIRED_PROFILE_FIELDS,
} from '../validation/employeeForm.schema'
import { EmployeeProfilePhotoEditor } from './EmployeeProfilePhotoEditor'
import type {
  EmployeeProfileFormState,
  EmploymentStatus,
  EmploymentType,
} from '../types/employeeProfile.types'

type EmployeeProfileFormProps = {
  value: EmployeeProfileFormState
  onChange: (next: EmployeeProfileFormState) => void
  readOnly?: boolean
  /** Which required-field set to mark with *. Defaults to create. */
  mode?: 'create' | 'update'
  /** Employment status choices; defaults to backend-supported statuses. */
  statusOptions?: EmploymentStatus[]
  /** Department options from GET /departments; when set, replaces the hardcoded list. */
  departmentOptions?: Array<{ id: string; name: string }>
  /** When set with departmentOptions, selects by department id (create flow). */
  departmentId?: string
  onDepartmentIdChange?: (departmentId: string) => void
}

const FALLBACK_DEPARTMENTS = [
  'Engineering',
  'HR',
  'Finance',
  'Product',
  'Sales & Marketing',
  'Operations',
]

const employmentTypes: EmploymentType[] = [
  'Full-time',
  'Part-time',
  'Contract',
  'Intern',
]

type FormField = keyof EmployeeProfileFormState

function Field({
  label,
  name,
  required,
  children,
}: {
  label: string
  name: FormField
  required: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </Label>
      {children}
    </div>
  )
}

/**
 * Shared registration / profile field set.
 * Additive form surface — used by Add Employee and Profile pages.
 */
export function EmployeeProfileForm({
  value,
  onChange,
  readOnly = false,
  mode = 'create',
  statusOptions = SERVER_EMPLOYMENT_STATUSES,
  departmentOptions,
  departmentId,
  onDepartmentIdChange,
}: EmployeeProfileFormProps) {
  const set = <K extends keyof EmployeeProfileFormState>(
    key: K,
    next: EmployeeProfileFormState[K],
  ) => onChange({ ...value, [key]: next })

  const disabled = readOnly
  const useServerDepartments = Boolean(departmentOptions)
  const requiredFields =
    mode === 'update' ? UPDATE_REQUIRED_PROFILE_FIELDS : CREATE_REQUIRED_PROFILE_FIELDS
  const isRequired = (name: FormField) => requiredFields.has(name)

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold tracking-wide text-navy uppercase">
          Personal Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Employee Code" name="employeeCode" required={isRequired('employeeCode')}>
            <Input
              id="employeeCode"
              disabled={disabled}
              value={value.employeeCode}
              onChange={(e) => set('employeeCode', e.target.value)}
              placeholder="e.g. EMP001"
            />
          </Field>
          <Field label="First Name" name="firstName" required={isRequired('firstName')}>
            <Input
              id="firstName"
              disabled={disabled}
              value={value.firstName}
              onChange={(e) => set('firstName', e.target.value)}
            />
          </Field>
          <Field label="Middle Name" name="middleName" required={false}>
            <Input
              id="middleName"
              disabled={disabled}
              value={value.middleName}
              onChange={(e) => set('middleName', e.target.value)}
            />
          </Field>
          <Field label="Last Name" name="lastName" required={isRequired('lastName')}>
            <Input
              id="lastName"
              disabled={disabled}
              value={value.lastName}
              onChange={(e) => set('lastName', e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3 space-y-2">
            <Label>
              Profile Photo
              {isRequired('profilePictureUrl') ? (
                <span className="text-rose-600"> *</span>
              ) : null}
            </Label>
            <EmployeeProfilePhotoEditor
              employeeId={value.employeeCode}
              firstName={value.firstName}
              lastName={value.lastName}
              pictureName={value.profilePictureName}
              pictureUrl={value.profilePictureUrl}
              readOnly={disabled}
              onPhotoChange={({ name, url }) =>
                onChange({
                  ...value,
                  profilePictureName: name,
                  profilePictureUrl: url,
                })
              }
            />
          </div>
          <Field label="Date of Birth" name="dateOfBirth" required={false}>
            <DatePicker
              id="dateOfBirth"
              disabled={disabled}
              value={value.dateOfBirth}
              maxDate={new Date().toISOString().slice(0, 10)}
              placeholder="Select date of birth"
              onChange={(next) => set('dateOfBirth', next)}
            />
          </Field>
          <Field label="Gender" name="gender" required={false}>
            <Select
              disabled={disabled}
              value={value.gender || undefined}
              onValueChange={(v) => set('gender', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {['Female', 'Male', 'Other', 'Prefer not to say'].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Marital Status" name="maritalStatus" required={false}>
            <Select
              disabled={disabled}
              value={value.maritalStatus || undefined}
              onValueChange={(v) => set('maritalStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {['Single', 'Married', 'Divorced', 'Widowed'].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Blood Group" name="bloodGroup" required={isRequired('bloodGroup')}>
            <Input
              id="bloodGroup"
              disabled={disabled}
              value={value.bloodGroup}
              onChange={(e) => set('bloodGroup', e.target.value)}
            />
          </Field>
          <Field label="Nationality" name="nationality" required={false}>
            <Input
              id="nationality"
              disabled={disabled}
              value={value.nationality}
              onChange={(e) => set('nationality', e.target.value)}
            />
          </Field>
          <Field label="Personal Email" name="personalEmail" required={false}>
            <Input
              id="personalEmail"
              disabled={disabled}
              type="email"
              value={value.personalEmail}
              onChange={(e) => set('personalEmail', e.target.value)}
            />
          </Field>
          <Field
            label="Personal Mobile Number"
            name="personalMobile"
            required={isRequired('personalMobile')}
          >
            <Input
              id="personalMobile"
              disabled={disabled}
              value={value.personalMobile}
              onChange={(e) => set('personalMobile', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold tracking-wide text-navy uppercase">
          Contact Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current Address" name="currentAddress" required={false}>
            <Textarea
              id="currentAddress"
              disabled={disabled}
              rows={2}
              value={value.currentAddress}
              onChange={(e) => set('currentAddress', e.target.value)}
            />
          </Field>
          <Field
            label="Permanent Address"
            name="permanentAddress"
            required={isRequired('permanentAddress')}
          >
            <Textarea
              id="permanentAddress"
              disabled={disabled}
              rows={2}
              value={value.permanentAddress}
              onChange={(e) => set('permanentAddress', e.target.value)}
            />
          </Field>
          <Field label="City" name="city" required={isRequired('city')}>
            <Input
              id="city"
              disabled={disabled}
              value={value.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </Field>
          <Field label="State" name="state" required={isRequired('state')}>
            <Input
              id="state"
              disabled={disabled}
              value={value.state}
              onChange={(e) => set('state', e.target.value)}
            />
          </Field>
          <Field label="Country" name="country" required={isRequired('country')}>
            <Input
              id="country"
              disabled={disabled}
              value={value.country}
              onChange={(e) => set('country', e.target.value)}
            />
          </Field>
          <Field label="PIN Code" name="pinCode" required={isRequired('pinCode')}>
            <Input
              id="pinCode"
              disabled={disabled}
              value={value.pinCode}
              onChange={(e) => set('pinCode', e.target.value)}
            />
          </Field>
          <Field label="Emergency Contact Person" name="emergencyContactPerson" required={false}>
            <Input
              id="emergencyContactPerson"
              disabled={disabled}
              value={value.emergencyContactPerson}
              onChange={(e) => set('emergencyContactPerson', e.target.value)}
            />
          </Field>
          <Field label="Emergency Contact Number" name="emergencyContactNumber" required={false}>
            <Input
              id="emergencyContactNumber"
              disabled={disabled}
              value={value.emergencyContactNumber}
              onChange={(e) => set('emergencyContactNumber', e.target.value)}
            />
          </Field>
          <Field
            label="Relationship with Emergency Contact"
            name="emergencyRelationship"
            required={false}
          >
            <Input
              id="emergencyRelationship"
              disabled={disabled}
              value={value.emergencyRelationship}
              onChange={(e) => set('emergencyRelationship', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold tracking-wide text-navy uppercase">
          Employment Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Date of Joining"
            name="dateOfJoining"
            required={isRequired('dateOfJoining')}
          >
            <DatePicker
              id="dateOfJoining"
              disabled={disabled}
              value={value.dateOfJoining}
              placeholder="Select joining date"
              onChange={(next) => set('dateOfJoining', next)}
            />
          </Field>
          <Field label="Employment Type" name="employmentType" required={false}>
            <Select
              disabled={disabled}
              value={value.employmentType}
              onValueChange={(v) => set('employmentType', v as EmploymentType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employmentTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Department" name="department" required={false}>
            {useServerDepartments ? (
              <Select
                disabled={disabled}
                value={departmentId || undefined}
                onValueChange={(v) => {
                  const selected = departmentOptions?.find((d) => d.id === v)
                  onDepartmentIdChange?.(v)
                  set('department', selected?.name ?? '')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {(departmentOptions ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                disabled={disabled}
                value={value.department || undefined}
                onValueChange={(v) => set('department', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {FALLBACK_DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
          <Field label="Designation" name="designation" required={isRequired('designation')}>
            <Input
              id="designation"
              disabled={disabled || mode === 'update'}
              value={value.designation}
              onChange={(e) => set('designation', e.target.value)}
            />
          </Field>
          <Field label="Job Role" name="jobRole" required={false}>
            <Input
              id="jobRole"
              disabled={disabled}
              value={value.jobRole}
              onChange={(e) => set('jobRole', e.target.value)}
            />
          </Field>
          <Field label="Reporting Manager" name="reportingManager" required={false}>
            <Input
              id="reportingManager"
              disabled={disabled}
              value={value.reportingManager}
              onChange={(e) => set('reportingManager', e.target.value)}
            />
          </Field>
          <Field label="Team Leader" name="teamLeader" required={false}>
            <Input
              id="teamLeader"
              disabled={disabled}
              value={value.teamLeader}
              onChange={(e) => set('teamLeader', e.target.value)}
            />
          </Field>
          <Field label="Work Location" name="workLocation" required={false}>
            <Input
              id="workLocation"
              disabled={disabled}
              value={value.workLocation}
              onChange={(e) => set('workLocation', e.target.value)}
            />
          </Field>
          <Field label="Branch" name="branch" required={false}>
            <Input
              id="branch"
              disabled={disabled}
              value={value.branch}
              onChange={(e) => set('branch', e.target.value)}
            />
          </Field>
          <Field label="Work Email" name="workEmail" required={isRequired('workEmail')}>
            <Input
              id="workEmail"
              disabled={disabled}
              type="email"
              value={value.workEmail}
              onChange={(e) => set('workEmail', e.target.value)}
            />
          </Field>
          <Field label="Work Phone" name="workPhone" required={false}>
            <Input
              id="workPhone"
              disabled={disabled}
              value={value.workPhone}
              onChange={(e) => set('workPhone', e.target.value)}
            />
          </Field>
          <Field
            label="Employment Status"
            name="employmentStatus"
            required={isRequired('employmentStatus')}
          >
            <Select
              disabled={disabled}
              value={value.employmentStatus}
              onValueChange={(v) =>
                set('employmentStatus', v as EmploymentStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Probation Start Date" name="probationStartDate" required={false}>
            <DatePicker
              id="probationStartDate"
              disabled={disabled}
              value={value.probationStartDate}
              placeholder="Select start date"
              onChange={(next) => set('probationStartDate', next)}
            />
          </Field>
          <Field label="Probation End Date" name="probationEndDate" required={false}>
            <DatePicker
              id="probationEndDate"
              disabled={disabled}
              value={value.probationEndDate}
              placeholder="Select end date"
              onChange={(next) => set('probationEndDate', next)}
            />
          </Field>
          <Field label="Confirmation Date" name="confirmationDate" required={false}>
            <DatePicker
              id="confirmationDate"
              disabled={disabled}
              value={value.confirmationDate}
              placeholder="Select confirmation date"
              onChange={(next) => set('confirmationDate', next)}
            />
          </Field>
          <Field label="Notice Period" name="noticePeriod" required={false}>
            <Input
              id="noticePeriod"
              disabled={disabled}
              value={value.noticePeriod}
              placeholder="e.g. 60 days"
              onChange={(e) => set('noticePeriod', e.target.value)}
            />
          </Field>
        </div>
      </section>
    </div>
  )
}
