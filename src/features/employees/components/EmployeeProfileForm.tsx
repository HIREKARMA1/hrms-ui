import { createContext, useContext, type ReactNode } from 'react'

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
  /** Fields with no backend column; marked "Not saved to the server yet". */
  unsupportedFields?: ReadonlySet<keyof EmployeeProfileFormState>
  /** Employment status choices; defaults to every UI status. */
  statusOptions?: EmploymentStatus[]
}

const departments = [
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

const statuses: EmploymentStatus[] = [
  'Active',
  'Inactive',
  'Probation',
  'Notice Period',
  'Resigned',
  'Terminated',
  'Archived',
]

type FormField = keyof EmployeeProfileFormState

/** Fields the server cannot store; they get a visible "not saved" hint. */
const UnsupportedFieldsContext = createContext<ReadonlySet<FormField> | null>(null)

function Field({
  label,
  name,
  children,
}: {
  label: string
  name: FormField
  children: ReactNode
}) {
  const unsupported = useContext(UnsupportedFieldsContext)?.has(name) ?? false
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {unsupported ? (
        <p className="text-xs text-amber-700">Not saved to the server yet.</p>
      ) : null}
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
  unsupportedFields,
  statusOptions = statuses,
}: EmployeeProfileFormProps) {
  const set = <K extends keyof EmployeeProfileFormState>(
    key: K,
    next: EmployeeProfileFormState[K],
  ) => onChange({ ...value, [key]: next })

  const disabled = readOnly

  return (
    <UnsupportedFieldsContext.Provider value={unsupportedFields ?? null}>
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold tracking-wide text-navy uppercase">
          Personal Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Employee ID" name="employeeId">
            <Input
              disabled={disabled}
              value={value.employeeId}
              onChange={(e) => set('employeeId', e.target.value)}
            />
          </Field>
          <Field label="First Name" name="firstName">
            <Input
              disabled={disabled}
              value={value.firstName}
              onChange={(e) => set('firstName', e.target.value)}
            />
          </Field>
          <Field label="Middle Name" name="middleName">
            <Input
              disabled={disabled}
              value={value.middleName}
              onChange={(e) => set('middleName', e.target.value)}
            />
          </Field>
          <Field label="Last Name" name="lastName">
            <Input
              disabled={disabled}
              value={value.lastName}
              onChange={(e) => set('lastName', e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <EmployeeProfilePhotoEditor
              employeeId={value.employeeId}
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
          <Field label="Date of Birth" name="dateOfBirth">
            <Input
              disabled={disabled}
              type="date"
              value={value.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
            />
          </Field>
          <Field label="Gender" name="gender">
            <Select
              disabled={disabled}
              value={value.gender}
              onValueChange={(v) => set('gender', v)}
            >
              <SelectTrigger>
                <SelectValue />
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
          <Field label="Marital Status" name="maritalStatus">
            <Select
              disabled={disabled}
              value={value.maritalStatus}
              onValueChange={(v) => set('maritalStatus', v)}
            >
              <SelectTrigger>
                <SelectValue />
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
          <Field label="Blood Group (optional)" name="bloodGroup">
            <Input
              disabled={disabled}
              value={value.bloodGroup}
              onChange={(e) => set('bloodGroup', e.target.value)}
            />
          </Field>
          <Field label="Nationality" name="nationality">
            <Input
              disabled={disabled}
              value={value.nationality}
              onChange={(e) => set('nationality', e.target.value)}
            />
          </Field>
          <Field label="Personal Email" name="personalEmail">
            <Input
              disabled={disabled}
              type="email"
              value={value.personalEmail}
              onChange={(e) => set('personalEmail', e.target.value)}
            />
          </Field>
          <Field label="Personal Mobile Number" name="personalMobile">
            <Input
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
          <Field label="Current Address" name="currentAddress">
            <Textarea
              disabled={disabled}
              rows={2}
              value={value.currentAddress}
              onChange={(e) => set('currentAddress', e.target.value)}
            />
          </Field>
          <Field label="Permanent Address" name="permanentAddress">
            <Textarea
              disabled={disabled}
              rows={2}
              value={value.permanentAddress}
              onChange={(e) => set('permanentAddress', e.target.value)}
            />
          </Field>
          <Field label="City" name="city">
            <Input
              disabled={disabled}
              value={value.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </Field>
          <Field label="State" name="state">
            <Input
              disabled={disabled}
              value={value.state}
              onChange={(e) => set('state', e.target.value)}
            />
          </Field>
          <Field label="Country" name="country">
            <Input
              disabled={disabled}
              value={value.country}
              onChange={(e) => set('country', e.target.value)}
            />
          </Field>
          <Field label="PIN Code" name="pinCode">
            <Input
              disabled={disabled}
              value={value.pinCode}
              onChange={(e) => set('pinCode', e.target.value)}
            />
          </Field>
          <Field label="Emergency Contact Person" name="emergencyContactPerson">
            <Input
              disabled={disabled}
              value={value.emergencyContactPerson}
              onChange={(e) => set('emergencyContactPerson', e.target.value)}
            />
          </Field>
          <Field label="Emergency Contact Number" name="emergencyContactNumber">
            <Input
              disabled={disabled}
              value={value.emergencyContactNumber}
              onChange={(e) => set('emergencyContactNumber', e.target.value)}
            />
          </Field>
          <Field label="Relationship with Emergency Contact" name="emergencyRelationship">
            <Input
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
          <Field label="Employee Code" name="employeeCode">
            <Input
              disabled={disabled}
              value={value.employeeCode}
              onChange={(e) => set('employeeCode', e.target.value)}
            />
          </Field>
          <Field label="Date of Joining" name="dateOfJoining">
            <Input
              disabled={disabled}
              type="date"
              value={value.dateOfJoining}
              onChange={(e) => set('dateOfJoining', e.target.value)}
            />
          </Field>
          <Field label="Employment Type" name="employmentType">
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
          <Field label="Department" name="department">
            <Select
              disabled={disabled}
              value={value.department}
              onValueChange={(v) => set('department', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Designation" name="designation">
            <Input
              disabled={disabled}
              value={value.designation}
              onChange={(e) => set('designation', e.target.value)}
            />
          </Field>
          <Field label="Job Role" name="jobRole">
            <Input
              disabled={disabled}
              value={value.jobRole}
              onChange={(e) => set('jobRole', e.target.value)}
            />
          </Field>
          <Field label="Reporting Manager" name="reportingManager">
            <Input
              disabled={disabled}
              value={value.reportingManager}
              onChange={(e) => set('reportingManager', e.target.value)}
            />
          </Field>
          <Field label="Team Leader" name="teamLeader">
            <Input
              disabled={disabled}
              value={value.teamLeader}
              onChange={(e) => set('teamLeader', e.target.value)}
            />
          </Field>
          <Field label="Work Location" name="workLocation">
            <Input
              disabled={disabled}
              value={value.workLocation}
              onChange={(e) => set('workLocation', e.target.value)}
            />
          </Field>
          <Field label="Branch" name="branch">
            <Input
              disabled={disabled}
              value={value.branch}
              onChange={(e) => set('branch', e.target.value)}
            />
          </Field>
          <Field label="Work Email" name="workEmail">
            <Input
              disabled={disabled}
              type="email"
              value={value.workEmail}
              onChange={(e) => set('workEmail', e.target.value)}
            />
          </Field>
          <Field label="Work Phone" name="workPhone">
            <Input
              disabled={disabled}
              value={value.workPhone}
              onChange={(e) => set('workPhone', e.target.value)}
            />
          </Field>
          <Field label="Employment Status" name="employmentStatus">
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
          <Field label="Probation Start Date" name="probationStartDate">
            <Input
              disabled={disabled}
              type="date"
              value={value.probationStartDate}
              onChange={(e) => set('probationStartDate', e.target.value)}
            />
          </Field>
          <Field label="Probation End Date" name="probationEndDate">
            <Input
              disabled={disabled}
              type="date"
              value={value.probationEndDate}
              onChange={(e) => set('probationEndDate', e.target.value)}
            />
          </Field>
          <Field label="Confirmation Date" name="confirmationDate">
            <Input
              disabled={disabled}
              type="date"
              value={value.confirmationDate}
              onChange={(e) => set('confirmationDate', e.target.value)}
            />
          </Field>
          <Field label="Notice Period" name="noticePeriod">
            <Input
              disabled={disabled}
              value={value.noticePeriod}
              onChange={(e) => set('noticePeriod', e.target.value)}
            />
          </Field>
          <Field label="Work Shift" name="workShift">
            <Input
              disabled={disabled}
              value={value.workShift}
              onChange={(e) => set('workShift', e.target.value)}
            />
          </Field>
        </div>
      </section>
    </div>
    </UnsupportedFieldsContext.Provider>
  )
}
