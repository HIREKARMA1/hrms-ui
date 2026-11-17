import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { EmployeeProfileForm } from '../components/EmployeeProfileForm'
import { employeeDirectoryMock } from '../mocks/employeeDirectory.mock'
import type {
  EmployeeProfile,
  EmployeeProfileFormState,
} from '../types/employeeProfile.types'

type EmployeeProfilePageProps = {
  /** When set, forces own-profile mode for employee self-service. */
  ownProfile?: boolean
  employeeIdParam?: string
}

function toFormState(profile: EmployeeProfile): EmployeeProfileFormState {
  const { id: _id, activityHistory: _history, ...rest } = profile
  return rest
}

export function EmployeeProfilePage({
  ownProfile = false,
  employeeIdParam,
}: EmployeeProfilePageProps) {
  const { employeeId: routeId } = useParams()
  const id = employeeIdParam ?? routeId
  const navigate = useNavigate()
  const rbac = useOptionalRbacSession()
  const { canAccess } = useOptionalFeatureAccess()
  const prefix = rbac?.routePrefix ?? '/hr'

  const initial = useMemo(() => {
    if (ownProfile) return structuredClone(employeeDirectoryMock[0])
    return structuredClone(
      employeeDirectoryMock.find((e) => e.id === id) ?? employeeDirectoryMock[0],
    )
  }, [id, ownProfile])

  const [profile, setProfile] = useState<EmployeeProfile>(initial)
  const [form, setForm] = useState<EmployeeProfileFormState>(() =>
    toFormState(initial),
  )
  const [note, setNote] = useState<string | null>(null)

  const canEdit =
    ownProfile
      ? canAccess('employee.profile.own')
      : canAccess('employee.registration.edit')

  const save = () => {
    if (!canEdit) return
    setProfile((prev) => ({
      ...prev,
      ...form,
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          at: new Date().toISOString().slice(0, 10),
          action: 'Profile saved (UI session)',
          by: ownProfile ? 'Employee' : 'HR (UI session)',
        },
        ...prev.activityHistory,
      ],
    }))
    setNote(
      'Profile updated in UI session only. No employee profile API is connected.',
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="warning">UI-only</Badge>
            <Badge variant="secondary">{profile.employmentStatus}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            {ownProfile ? 'My Profile' : 'Employee Profile'}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {profile.firstName} {profile.lastName} · {profile.employeeId} ·{' '}
            {profile.department}
          </p>
        </div>
        {!ownProfile ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`${prefix}/employees/directory`)}
          >
            Back to Directory
          </Button>
        ) : null}
      </div>

      {note ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          {note}
        </div>
      ) : null}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Profile details</TabsTrigger>
          <TabsTrigger value="activity">Activity history</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
              <CardDescription>
                {canEdit
                  ? 'Edit and save changes locally until APIs are available.'
                  : 'View-only access for your role.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmployeeProfileForm
                value={form}
                onChange={setForm}
                readOnly={!canEdit}
              />
              {canEdit ? (
                <Button type="button" onClick={save}>
                  Save Profile
                </Button>
              ) : (
                <Feature name="employee.registration.view">
                  <p className="text-sm text-text-secondary">
                    Editing is disabled for your role.
                  </p>
                </Feature>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Employee activity history</CardTitle>
              <CardDescription>Status and profile change trail</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {profile.activityHistory.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-border-soft px-4 py-3 text-sm"
                  >
                    <p className="font-medium text-navy">{item.action}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {item.at} · {item.by}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function MyEmployeeProfilePage() {
  return <EmployeeProfilePage ownProfile />
}
