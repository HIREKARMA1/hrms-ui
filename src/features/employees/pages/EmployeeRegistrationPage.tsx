import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  buildCreateFormData,
  CREATE_UNSUPPORTED_FIELDS,
  emptyCreateExtras,
  SERVER_EMPLOYMENT_STATUSES,
  type EmployeeCreateExtras,
  type UnsupportedChange,
} from '../api/employeeMappers'
import { getEmployeeErrorMessage, useCreateEmployeeMutation } from '../api/employeesApi'
import { EmployeeNotice, UnsupportedFieldsNotice } from '../components/EmployeeNotice'
import { EmployeeProfileForm } from '../components/EmployeeProfileForm'
import { EmployeeServerDetailsSection } from '../components/EmployeeServerDetailsSection'
import type { EmployeeProfileFormState } from '../types/employeeProfile.types'
import { emptyEmployeeForm } from '../utils/employeeForm'

type Notice = { tone: 'success' | 'warning' | 'error'; text: string; details?: string[] }

/**
 * Registration for `/…/employees/add`. Submits POST /employees (multipart).
 */
export function EmployeeRegistrationPage() {
  const navigate = useNavigate()
  const rbac = useOptionalRbacSession()
  const prefix = rbac?.routePrefix ?? '/hr'
  const [form, setForm] = useState<EmployeeProfileFormState>(() => emptyEmployeeForm())
  const [extras, setExtras] = useState<EmployeeCreateExtras>(() => emptyCreateExtras())
  const [notice, setNotice] = useState<Notice | null>(null)
  const [unsupported, setUnsupported] = useState<UnsupportedChange[]>([])
  const [createdId, setCreatedId] = useState<string | null>(null)
  // Remounts the file inputs, which cannot be cleared through state.
  const [formKey, setFormKey] = useState(0)
  const [createEmployee, createState] = useCreateEmployeeMutation()

  const save = async () => {
    const result = buildCreateFormData(form, extras)
    setUnsupported(result.unsupported)
    if (!result.formData) {
      setNotice({ tone: 'error', text: 'Please fix the following before saving:', details: result.errors })
      return
    }
    setNotice(null)
    setCreatedId(null)
    try {
      const { record, deviceSync } = await createEmployee(result.formData).unwrap()
      setCreatedId(record.server.id)
      const deviceFailed = deviceSync?.status === 'failed'
      setNotice({
        tone: deviceFailed ? 'warning' : 'success',
        text: `${record.profile.firstName} ${record.profile.lastName} (${record.profile.employeeCode}) was registered.${
          deviceFailed ? ` Biometric device sync failed: ${deviceSync?.message}` : ''
        }`,
      })
    } catch (error) {
      setNotice({ tone: 'error', text: getEmployeeErrorMessage(error, 'Could not register the employee.') })
    }
  }

  const reset = () => {
    setForm(emptyEmployeeForm())
    setExtras(emptyCreateExtras())
    setNotice(null)
    setUnsupported([])
    setCreatedId(null)
    setFormKey((key) => key + 1)
  }

  const saving = createState.isLoading

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
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
          {notice.details?.length ? (
            <ul className="mt-1 list-disc pl-5">
              {notice.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
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
      <UnsupportedFieldsNotice changes={unsupported} />

      <Card className="border-border-soft shadow-sm" key={formKey}>
        <CardHeader>
          <CardTitle>Registration form</CardTitle>
          <CardDescription>
            Fields marked "Not saved to the server yet" have no backend field and are not stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Feature
            name="employee.registration.edit"
            fallback={
              <EmployeeProfileForm value={form} onChange={setForm} readOnly />
            }
          >
            <EmployeeProfileForm
              value={form}
              onChange={setForm}
              readOnly={saving}
              unsupportedFields={CREATE_UNSUPPORTED_FIELDS}
              statusOptions={SERVER_EMPLOYMENT_STATUSES}
            />
            <EmployeeServerDetailsSection
              value={extras}
              onChange={setExtras}
              profilePictureUrl={form.profilePictureUrl}
              disabled={saving}
            />
          </Feature>

          <div className="flex flex-wrap gap-2">
            <Feature name="employee.registration.edit">
              <Button type="button" disabled={saving} onClick={() => void save()}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
