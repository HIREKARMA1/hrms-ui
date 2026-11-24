import { ArrowLeft, Check, Copy, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { BiometricDeviceSelect } from '@/features/employees/components/BiometricDeviceSelect'
import { Feature } from '@/features/rbac/components/Feature'
import { useListDepartmentsQuery } from '@/features/organization/api/departmentsApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  useGetOrganisationOnboardingQuery,
  useVerifyOrganisationOnboardingMutation,
} from '../api/organisationOnboardingApi'
import type { OnboardingFormStatus } from '../api/organisationOnboardingApi.types'
import {
  buildOnboardingFormLink,
  copyTextToClipboard,
} from '../utils/onboardingFormLink'

function statusBadgeClass(status: OnboardingFormStatus) {
  switch (status) {
    case 'FILLED':
      return 'border-amber-200 bg-amber-50 text-amber-800'
    case 'VERIFIED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm text-navy break-words">{value?.trim() || '—'}</p>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-navy">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}

export function OrganisationOnboardingDetailPage() {
  const { onboardingId = '' } = useParams()
  const location = useLocation()
  const prefix = location.pathname.startsWith('/superadmin')
    ? '/superadmin'
    : '/hradmin'

  const detail = useGetOrganisationOnboardingQuery(onboardingId, {
    skip: !onboardingId,
  })
  const [verify, verifyState] = useVerifyOrganisationOnboardingMutation()
  const departmentsQuery = useListDepartmentsQuery({
    isActive: true,
    limit: 100,
    page: 1,
  })

  const [designation, setDesignation] = useState('')
  const [dateOfJoining, setDateOfJoining] = useState('')
  const [employmentStatus, setEmploymentStatus] = useState('PROBATION')
  const [deviceId, setDeviceId] = useState('')
  const [deviceUserId, setDeviceUserId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const row = detail.data

  async function handleCopy() {
    if (!row) return
    const ok = await copyTextToClipboard(buildOnboardingFormLink(row.id))
    setCopied(ok)
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSuccess(null)
    if (!row) return
    if (!designation.trim() || !dateOfJoining || !deviceId.trim()) {
      setFormError('Designation, date of joining, and a biometric device are required.')
      return
    }
    try {
      const result = await verify({
        id: row.id,
        body: {
          designation: designation.trim(),
          dateOfJoining,
          employmentStatus: employmentStatus as
            | 'ACTIVE'
            | 'ON_LEAVE'
            | 'PROBATION'
            | 'TERMINATED',
          deviceId: deviceId.trim(),
          ...(deviceUserId.trim() ? { deviceUserId: deviceUserId.trim() } : {}),
          ...(departmentId ? { departmentId } : {}),
          role: 'EMPLOYEE',
        },
      }).unwrap()
      setSuccess(
        `Verified. Employee ${result.employeeCode} created. Documents are available under Employee Documents.`,
      )
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Verification failed.'))
    }
  }

  if (detail.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[960px] space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (detail.isError || !row) {
    return (
      <div className="mx-auto w-full max-w-[960px] space-y-4">
        <Button type="button" variant="ghost" asChild>
          <Link to={`${prefix}/organisation-onboarding`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(detail.error, 'Onboarding not found.')}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button type="button" variant="ghost" className="-ml-2 mb-2" asChild>
            <Link to={`${prefix}/organisation-onboarding`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to list
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              {row.employeeCode}
            </h1>
            <Badge variant="outline" className={statusBadgeClass(row.status)}>
              {row.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">{row.email}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void handleCopy()}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          Copy form link
        </Button>
      </div>

      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {success}
          {row.employeeId || success.includes('Employee') ? (
            <>
              {' '}
              <Link
                className="font-medium underline"
                to={`${prefix}/documents`}
              >
                Open Employee Documents
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      <Section title="Seed identity">
        <Field label="First name" value={row.firstName} />
        <Field label="Last name" value={row.lastName} />
        <Field label="Date of birth" value={row.dateOfBirth?.toString().slice(0, 10)} />
        <Field label="Expires" value={row.expiresAt?.toString().slice(0, 10)} />
        <Field label="Filled at" value={row.filledAt?.toString().slice(0, 19)} />
        <Field label="Employee id" value={row.employeeId} />
      </Section>

      <Section title="Contact & KYC">
        <Field label="Phone" value={row.phone} />
        <Field label="Professional identity" value={row.professionalIdentity} />
        <Field label="Aadhaar" value={row.aadhaar} />
        <Field label="PAN" value={row.pan} />
        <Field label="Blood group" value={row.bloodGroup} />
        <Field label="UAN" value={row.uanNumber} />
        <Field label="Photo URL" value={row.photoUrl} />
        <Field
          label="Salary slips"
          value={
            (row.salarySlipUrls?.length
              ? row.salarySlipUrls
              : row.salarySlipUrl
                ? [row.salarySlipUrl]
                : []
            ).join('\n') || null
          }
        />
        <Field label="Relieving letter" value={row.relievingLetterUrl} />
      </Section>

      <Section title="Permanent address">
        <Field label="Line 1" value={row.permanentAddress?.line1} />
        <Field label="Line 2" value={row.permanentAddress?.line2} />
        <Field label="City" value={row.permanentAddress?.city} />
        <Field label="State" value={row.permanentAddress?.state} />
        <Field label="Pincode" value={row.permanentAddress?.pincode} />
        <Field label="Country" value={row.permanentAddress?.country} />
      </Section>

      <Section title="Current address">
        <Field label="Line 1" value={row.currentAddress?.line1} />
        <Field label="Line 2" value={row.currentAddress?.line2} />
        <Field label="City" value={row.currentAddress?.city} />
        <Field label="State" value={row.currentAddress?.state} />
        <Field label="Pincode" value={row.currentAddress?.pincode} />
        <Field label="Country" value={row.currentAddress?.country} />
      </Section>

      <Section title="Bank details">
        <Field label="Account holder" value={row.bankDetail?.accountHolderName} />
        <Field label="Account number" value={row.bankDetail?.accountNumber} />
        <Field label="IFSC" value={row.bankDetail?.ifsc} />
        <Field label="Bank" value={row.bankDetail?.bankName} />
        <Field label="Branch" value={row.bankDetail?.branch} />
      </Section>

      {row.status === 'FILLED' ? (
        <Feature name="onboarding.verify">
          <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-navy">Verify & promote</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Creates the employee record, attaches salary slip / relieving letter documents, and
              claims the temporary login.
            </p>
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => void handleVerify(e)}>
              <div>
                <Label htmlFor="v-designation">Designation *</Label>
                <Input
                  id="v-designation"
                  className="mt-1.5"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="v-doj">Date of joining *</Label>
                <Input
                  id="v-doj"
                  type="date"
                  className="mt-1.5"
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                />
              </div>
              <div>
                <Label>Employment status *</Label>
                <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROBATION">Probation</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_LEAVE">On leave</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select
                  value={departmentId || '__none__'}
                  onValueChange={(v) => setDepartmentId(v === '__none__' ? '' : v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {(departmentsQuery.data?.items ?? []).map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="v-device">
                  Device <span className="text-red-600">*</span>
                </Label>
                <div className="mt-1.5">
                  <BiometricDeviceSelect
                    id="v-device"
                    value={deviceId}
                    onChange={setDeviceId}
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Choose an onboarded biometric device. Device code is sent as Device ID.
                </p>
              </div>
              <div>
                <Label htmlFor="v-device-user">Device user ID</Label>
                <Input
                  id="v-device-user"
                  className="mt-1.5"
                  value={deviceUserId}
                  onChange={(e) => setDeviceUserId(e.target.value)}
                  placeholder="TimeWatch UserID on that device"
                />
                <p className="mt-1 text-xs text-text-secondary">
                  Enter manually (optional). Can be set later on the employee profile.
                </p>
              </div>
              {formError ? (
                <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              ) : null}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={verifyState.isLoading}>
                  {verifyState.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Mark verified
                </Button>
              </div>
            </form>
          </section>
        </Feature>
      ) : null}

      {row.status === 'VERIFIED' && row.employeeId ? (
        <p className="text-sm text-text-secondary">
          Linked employee:{' '}
          <Link
            className="font-medium text-brand-600 underline"
            to={`${prefix}/employees/profile/${row.employeeId}`}
          >
            View profile
          </Link>
          {' · '}
          <Link className="font-medium text-brand-600 underline" to={`${prefix}/documents`}>
            Employee Documents
          </Link>
        </p>
      ) : null}
    </div>
  )
}

export default OrganisationOnboardingDetailPage
