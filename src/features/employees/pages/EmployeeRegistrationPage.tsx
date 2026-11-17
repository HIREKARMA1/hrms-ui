import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { EmployeeProfileForm } from '../components/EmployeeProfileForm'
import { emptyEmployeeForm } from '../mocks/employeeDirectory.mock'
import type { EmployeeProfileFormState } from '../types/employeeProfile.types'

/**
 * New registration page for existing `/…/employees/add` nav targets.
 * No prior registration form existed — this is additive, not a rewrite.
 */
export function EmployeeRegistrationPage() {
  const navigate = useNavigate()
  const rbac = useOptionalRbacSession()
  const prefix = rbac?.routePrefix ?? '/hr'
  const [form, setForm] = useState<EmployeeProfileFormState>(() => emptyEmployeeForm())
  const [savedNote, setSavedNote] = useState<string | null>(null)

  const save = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setSavedNote('First name and last name are required.')
      return
    }
    setSavedNote(
      'Employee draft saved in UI session only. No employee registration API is connected.',
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="warning">UI-only</Badge>
            <Badge variant="secondary">No registration API</Badge>
          </div>
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

      {savedNote ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          {savedNote}
        </div>
      ) : null}

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>Registration form</CardTitle>
          <CardDescription>
            All fields below are part of the employee master record.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Feature
            name="employee.registration.edit"
            fallback={
              <EmployeeProfileForm value={form} onChange={setForm} readOnly />
            }
          >
            <EmployeeProfileForm value={form} onChange={setForm} />
          </Feature>

          <div className="flex flex-wrap gap-2">
            <Feature name="employee.registration.edit">
              <Button type="button" onClick={save}>
                Save Employee
              </Button>
            </Feature>
            <Button
              type="button"
              variant="outline"
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
