import type { ReactNode } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { EMPLOYEE_DOCUMENT_FIELDS, type BackendUserRole } from '../api/employeeApi.types'
import type { EmployeeCreateExtras } from '../api/employeeMappers'
import { BiometricDeviceSelect } from './BiometricDeviceSelect'

const ROLE_OPTIONS: Array<{ value: BackendUserRole; label: string }> = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'HR_ADMIN', label: 'HR Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
]

const DOCUMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp'

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-text-secondary">{hint}</p> : null}
    </div>
  )
}

/**
 * Create-only fields required by POST /employees that the shared profile
 * form does not have (KYC, bank, device link, login role, documents).
 * Values are sent once and are not shown again on the profile.
 */
export function EmployeeServerDetailsSection({
  value,
  onChange,
  disabled = false,
}: {
  value: EmployeeCreateExtras
  onChange: (next: EmployeeCreateExtras) => void
  disabled?: boolean
}) {
  const set = <K extends keyof EmployeeCreateExtras>(key: K, next: EmployeeCreateExtras[K]) =>
    onChange({ ...value, [key]: next })
  const setBank = (key: keyof EmployeeCreateExtras['bankDetail'], next: string) =>
    onChange({ ...value, bankDetail: { ...value.bankDetail, [key]: next } })

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-navy">Login, KYC and device</h3>
          <p className="text-xs text-text-secondary">
            Required fields are marked with *. Aadhaar, PAN and bank details are stored securely and
            are not shown on the profile afterwards.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Login role" required>
            <Select
              value={value.role}
              onValueChange={(v) => set('role', v as BackendUserRole)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Aadhaar number" required>
            <Input
              value={value.aadhaar}
              inputMode="numeric"
              maxLength={12}
              autoComplete="off"
              placeholder="12 digits"
              disabled={disabled}
              onChange={(e) => set('aadhaar', e.target.value.replace(/\D/g, ''))}
            />
          </Field>
          <Field label="PAN" required>
            <Input
              value={value.pan}
              maxLength={10}
              autoComplete="off"
              placeholder="ABCDE1234F"
              disabled={disabled}
              onChange={(e) => set('pan', e.target.value.toUpperCase())}
            />
          </Field>
          <Field label="UAN">
            <Input
              value={value.uanNumber}
              autoComplete="off"
              disabled={disabled}
              onChange={(e) => set('uanNumber', e.target.value)}
            />
          </Field>
          <Field
            label="Device ID"
            required
            hint="Required by POST /employees. Use the device code of an onboarded biometric device."
          >
            <Input
              value={value.deviceId}
              autoComplete="off"
              placeholder="e.g. TW1KDW0010250461"
              disabled={disabled}
              onChange={(e) => set('deviceId', e.target.value.trim())}
            />
          </Field>
          <Field
            label="Pick registered device"
            hint="Optional shortcut — fills Device ID from onboarded devices."
          >
            <BiometricDeviceSelect
              value={value.deviceId}
              disabled={disabled}
              onChange={(deviceCode) => set('deviceId', deviceCode)}
            />
          </Field>
          <Field
            label="Employee device user ID"
            hint="TimeWatch UserID of this employee on the device (optional; can be set later)."
          >
            <Input
              value={value.deviceUserId}
              autoComplete="off"
              placeholder="e.g. 61"
              disabled={disabled}
              onChange={(e) => set('deviceUserId', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-navy">Bank details</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Account holder name" required>
            <Input
              value={value.bankDetail.accountHolderName}
              disabled={disabled}
              onChange={(e) => setBank('accountHolderName', e.target.value)}
            />
          </Field>
          <Field label="Account number" required>
            <Input
              value={value.bankDetail.accountNumber}
              inputMode="numeric"
              autoComplete="off"
              disabled={disabled}
              onChange={(e) => setBank('accountNumber', e.target.value)}
            />
          </Field>
          <Field
            label="IFSC"
            required
            hint="Must be 11 characters like SBIN0001234 (4 letters + 0 + 6 digits/letters)."
          >
            <Input
              value={value.bankDetail.ifsc}
              maxLength={11}
              placeholder="SBIN0001234"
              disabled={disabled}
              onChange={(e) => setBank('ifsc', e.target.value.toUpperCase())}
            />
          </Field>
          <Field label="Bank name" required>
            <Input
              value={value.bankDetail.bankName}
              disabled={disabled}
              onChange={(e) => setBank('bankName', e.target.value)}
            />
          </Field>
          <Field label="Branch">
            <Input
              value={value.bankDetail.branch}
              disabled={disabled}
              onChange={(e) => setBank('branch', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-navy">Documents</h3>
          <p className="text-xs text-text-secondary">
            Optional. PDF, JPEG, PNG or WebP, up to 10MB each. Documents can only be uploaded at
            registration.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EMPLOYEE_DOCUMENT_FIELDS.map(({ field, label }) => (
            <Field key={field} label={label}>
              <Input
                type="file"
                accept={DOCUMENT_ACCEPT}
                disabled={disabled}
                onChange={(e) =>
                  set('documents', { ...value.documents, [field]: e.target.files?.[0] ?? null })
                }
              />
            </Field>
          ))}
        </div>
      </section>
    </div>
  )
}
