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
import { isHttpUrl, type EmployeeCreateExtras } from '../api/employeeMappers'
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
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </Label>
      {children}
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
  profilePictureUrl,
  disabled = false,
}: {
  value: EmployeeCreateExtras
  onChange: (next: EmployeeCreateExtras) => void
  profilePictureUrl: string
  disabled?: boolean
}) {
  const set = <K extends keyof EmployeeCreateExtras>(key: K, next: EmployeeCreateExtras[K]) =>
    onChange({ ...value, [key]: next })
  const setBank = (key: keyof EmployeeCreateExtras['bankDetail'], next: string) =>
    onChange({ ...value, bankDetail: { ...value.bankDetail, [key]: next } })
  const needsPhotoUrl = !isHttpUrl(profilePictureUrl.trim())

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
          <Field label="Biometric device" required>
            <BiometricDeviceSelect
              value={value.deviceId}
              disabled={disabled}
              onChange={(deviceCode) => set('deviceId', deviceCode)}
            />
          </Field>
          <Field label="Device user ID">
            <Input
              value={value.deviceUserId}
              disabled={disabled}
              onChange={(e) => set('deviceUserId', e.target.value)}
            />
          </Field>
          {needsPhotoUrl ? (
            <Field label="Photo URL" required>
              <Input
                type="url"
                value={value.photoUrl}
                placeholder="https://…"
                disabled={disabled}
                onChange={(e) => set('photoUrl', e.target.value)}
              />
            </Field>
          ) : null}
        </div>
        {needsPhotoUrl ? (
          <p className="text-xs text-text-secondary">
            Upload a photo above, or paste a hosted photo URL (http/https).
          </p>
        ) : null}
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
          <Field label="IFSC" required>
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
