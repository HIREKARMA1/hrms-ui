import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'
import { useListDepartmentsQuery } from '@/features/organization/api/departmentsApi'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ToastBanner, useToast } from '@/hooks/useToast'

import {
  buildCreateFormData,
  emptyCreateExtras,
  SERVER_EMPLOYMENT_STATUSES,
  type EmployeeCreateExtras,
} from '../api/employeeMappers'
import { getEmployeeErrorMessage, useCreateEmployeeMutation } from '../api/employeesApi'
import { CreateEmployeeLoginPanel } from '../components/CreateEmployeeLoginPanel'
import { EmployeeNotice } from '../components/EmployeeNotice'
import { EmployeeProfileForm } from '../components/EmployeeProfileForm'
import { EmployeeServerDetailsSection } from '../components/EmployeeServerDetailsSection'
import type { EmployeeProfileFormState } from '../types/employeeProfile.types'
import { emptyEmployeeForm } from '../utils/employeeForm'
import { validateEmployeeCreate } from '../validation/employeeForm.schema'

type Notice = { tone: 'success' | 'warning'; text: string }

/**
 * Registration for `/…/employees/add`. Submits POST /employees (multipart),
 * then optionally POST /users for the login account.
 */
export function EmployeeRegistrationPage() {
  const navigate = useNavigate()
  const rbac = useOptionalRbacSession()
  const prefix = rbac?.routePrefix ?? '/hr'
  const { message, tone, toast } = useToast(6000)
  const [form, setForm] = useState<EmployeeProfileFormState>(() => emptyEmployeeForm())
  const [extras, setExtras] = useState<EmployeeCreateExtras>(() => emptyCreateExtras())
  const [notice, setNotice] = useState<Notice | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [createdEmail, setCreatedEmail] = useState('')
  const [createdLabel, setCreatedLabel] = useState('')
  const [loginDone, setLoginDone] = useState(false)
  // Remounts the file inputs, which cannot be cleared through state.
  const [formKey, setFormKey] = useState(0)
  const [createEmployee, createState] = useCreateEmployeeMutation()
  const departmentsQuery = useListDepartmentsQuery({ isActive: true, limit: 100, page: 1 })
  const departmentOptions =
    departmentsQuery.data?.items.map((d) => ({ id: d.id, name: d.name })) ?? []

  const createValidation = useMemo(() => validateEmployeeCreate(form, extras), [form, extras])
  const canSubmit = createValidation.ok

  const save = async () => {
    const validation = validateEmployeeCreate(form, extras)
    if (!validation.ok) {
      toast(validation.errors.join(' · ') || 'Please fill all required fields.', 'error')
      return
    }

    const result = buildCreateFormData(form, extras)
    if (!result.formData) {
      toast(result.errors.join(' · ') || 'Please fix the form before saving.', 'error')
      return
    }
    setNotice(null)
    setCreatedId(null)
    setLoginDone(false)
    try {
      const { record, deviceSync } = await createEmployee(result.formData).unwrap()
      setCreatedId(record.server.id)
      setCreatedEmail(record.profile.workEmail)
      setCreatedLabel(`${record.profile.firstName} ${record.profile.lastName}`)
      const deviceFailed = deviceSync?.status === 'failed'
      setNotice({
        tone: deviceFailed ? 'warning' : 'success',
        text: `${record.profile.firstName} ${record.profile.lastName} (${record.profile.employeeCode}) was registered.${
          deviceFailed ? ` Biometric device sync failed: ${deviceSync?.message}` : ''
        } Create a login below, or skip and do it later from the profile.`,
      })
      if (deviceFailed) {
        toast(deviceSync?.message ?? 'Biometric device sync failed.', 'warning')
      } else {
        toast('Employee registered successfully.', 'success')
      }
    } catch (error) {
      toast(getEmployeeErrorMessage(error, 'Could not register the employee.'), 'error')
    }
  }

  const reset = () => {
    setForm(emptyEmployeeForm())
    setExtras(emptyCreateExtras())
    setNotice(null)
    setCreatedId(null)
    setCreatedEmail('')
    setCreatedLabel('')
    setLoginDone(false)
    setFormKey((key) => key + 1)
  }

  const saving = createState.isLoading
  const showForm = !createdId

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <ToastBanner message={message} tone={tone} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Employee Registration
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Register a new employee with personal, contact, and employment details.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(`${prefix}/employees/directory`)}
        >
          Open Directory
        </Button>
      </div>

      {notice ? (
        <EmployeeNotice tone={notice.tone}>
          {notice.text}
          {createdId ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => navigate(`${prefix}/employees/profile/${createdId}`)}
              >
                Open profile
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={reset}>
                Register another
              </Button>
            </div>
          ) : null}
        </EmployeeNotice>
      ) : null}

      {showForm ? (
        <Card className="border-border-soft shadow-sm" key={formKey}>
          <CardHeader>
            <CardTitle>Registration form</CardTitle>
            <CardDescription>
              Fields marked with <span className="text-rose-600">*</span> are required. Save stays
              disabled until every required field is valid.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Feature
              name="employee.registration.edit"
              fallback={
                <EmployeeProfileForm value={form} onChange={setForm} readOnly mode="create" />
              }
            >
              <EmployeeProfileForm
                value={form}
                onChange={setForm}
                readOnly={saving}
                mode="create"
                statusOptions={SERVER_EMPLOYMENT_STATUSES}
                departmentOptions={departmentOptions}
                departmentId={extras.departmentId}
                onDepartmentIdChange={(departmentId) =>
                  setExtras((prev) => ({ ...prev, departmentId }))
                }
              />
              <EmployeeServerDetailsSection
                value={extras}
                onChange={setExtras}
                profilePictureUrl={form.profilePictureUrl}
                disabled={saving}
              />
            </Feature>

            <div className="flex flex-wrap items-center gap-2">
              <Feature name="employee.registration.edit">
                <Button
                  type="button"
                  disabled={saving || !canSubmit}
                  onClick={() => void save()}
                >
                  {saving ? 'Saving…' : 'Save Employee'}
                </Button>
              </Feature>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => navigate(`${prefix}/employees`)}
              >
                Cancel
              </Button>
              {!canSubmit ? (
                <p className="text-xs text-text-secondary">
                  Fill all required fields (*) to enable Save.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {createdId && !loginDone ? (
        <CreateEmployeeLoginPanel
          employeeId={createdId}
          defaultEmail={createdEmail}
          employeeLabel={createdLabel}
          onCreated={() => setLoginDone(true)}
          onSkip={() => setLoginDone(true)}
        />
      ) : null}
    </div>
  )
}
