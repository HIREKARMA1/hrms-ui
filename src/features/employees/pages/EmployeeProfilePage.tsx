import { ExternalLink, RefreshCw } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  buildUpdatePayload,
  SERVER_EMPLOYMENT_STATUSES,
  toFormState,
  UPDATE_UNSUPPORTED_FIELDS,
  type EmployeeRecord,
  type UnsupportedChange,
} from '../api/employeeMappers'
import {
  getEmployeeErrorMessage,
  useGetEmployeeQuery,
  useSyncEmployeeDeviceMutation,
  useUpdateEmployeeMutation,
} from '../api/employeesApi'
import type { DeviceSyncOutcome } from '../api/employeeApi.types'
import { EmployeeNotice, UnsupportedFieldsNotice } from '../components/EmployeeNotice'
import { EmployeeProfileForm } from '../components/EmployeeProfileForm'
import { employeeDirectoryMock } from '../mocks/employeeDirectory.mock'
import type {
  EmployeeActivityItem,
  EmployeeProfile,
  EmployeeProfileFormState,
} from '../types/employeeProfile.types'
import { isNotFoundError } from '../utils/queryViewState'

type EmployeeProfilePageProps = {
  /** When set, forces own-profile mode for employee self-service. */
  ownProfile?: boolean
  employeeIdParam?: string
}

type Notice = { tone: 'success' | 'warning' | 'error'; text: string; details?: string[] }

function sessionActivity(action: string, by: string): EmployeeActivityItem {
  return {
    id: `act-${Date.now()}`,
    at: new Date().toISOString().slice(0, 10),
    action,
    by,
  }
}

function deviceSyncText(sync: DeviceSyncOutcome | null): string {
  if (!sync) return ''
  return sync.status === 'failed'
    ? ` Biometric device sync failed: ${sync.message}`
    : ` Biometric device: ${sync.message}`
}

export function EmployeeProfilePage({
  ownProfile = false,
  employeeIdParam,
}: EmployeeProfilePageProps) {
  const { employeeId: routeId } = useParams()
  const id = employeeIdParam ?? routeId
  if (ownProfile) return <SampleOwnProfile />
  return <ServerEmployeeProfile id={id ?? ''} />
}

// ---------------------------------------------------------------------------
// HR view: GET /employees/:id + PATCH /employees/:id
// ---------------------------------------------------------------------------

function ServerEmployeeProfile({ id }: { id: string }) {
  const navigate = useNavigate()
  const rbac = useOptionalRbacSession()
  const prefix = rbac?.routePrefix ?? '/hr'
  const { data: record, isLoading, isError, error, refetch, isFetching } =
    useGetEmployeeQuery(id, { skip: !id })

  const back = (
    <Button
      type="button"
      variant="outline"
      onClick={() => navigate(`${prefix}/employees/directory`)}
    >
      Back to Directory
    </Button>
  )

  if (!record) {
    if (!id || (isError && isNotFoundError(error))) {
      return (
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-start gap-4">
          <EmployeeNotice tone="warning">This employee could not be found.</EmployeeNotice>
          {back}
        </div>
      )
    }
    if (isError) {
      return (
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-start gap-4">
          <EmployeeNotice tone="error">
            {getEmployeeErrorMessage(error, 'Could not load this employee.')}
          </EmployeeNotice>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            {back}
          </div>
        </div>
      )
    }
    return (
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6" aria-busy={isLoading}>
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </div>
    )
  }

  return <ServerProfileEditor key={record.server.id} record={record} back={back} />
}

function ServerProfileEditor({
  record,
  back,
}: {
  record: EmployeeRecord
  back: ReactNode
}) {
  const { canAccess } = useOptionalFeatureAccess()
  const canEdit = canAccess('employee.manage')
  const [form, setForm] = useState<EmployeeProfileFormState>(() => toFormState(record.profile))
  const [notice, setNotice] = useState<Notice | null>(null)
  const [unsupported, setUnsupported] = useState<UnsupportedChange[]>([])
  const [activity, setActivity] = useState<EmployeeActivityItem[]>([])
  const [updateEmployee, updateState] = useUpdateEmployeeMutation()
  const [syncDevice, syncState] = useSyncEmployeeDeviceMutation()
  const { profile, server } = record

  const save = async () => {
    if (!canEdit) return
    const result = buildUpdatePayload(form, record)
    setUnsupported(result.unsupported)
    if (result.errors.length > 0) {
      setNotice({ tone: 'error', text: 'Please fix the following before saving:', details: result.errors })
      return
    }
    if (Object.keys(result.body).length === 0) {
      setNotice({
        tone: result.unsupported.length ? 'warning' : 'success',
        text: result.unsupported.length
          ? 'Nothing was sent: none of the changed fields can be stored by the server yet.'
          : 'No changes to save.',
      })
      return
    }
    setNotice(null)
    try {
      const { deviceSync } = await updateEmployee({ id: server.id, body: result.body }).unwrap()
      setActivity((prev) => [sessionActivity('Profile saved', 'You (this session)'), ...prev])
      setNotice({
        tone: deviceSync?.status === 'failed' ? 'warning' : 'success',
        text: `Profile saved.${deviceSyncText(deviceSync)}`,
      })
    } catch (error) {
      setNotice({ tone: 'error', text: getEmployeeErrorMessage(error, 'Could not save the profile.') })
    }
  }

  const sync = async () => {
    setNotice(null)
    try {
      const { deviceSync } = await syncDevice({ id: server.id, mode: 'push' }).unwrap()
      setActivity((prev) => [sessionActivity('Synced to biometric device', 'You (this session)'), ...prev])
      setNotice({
        tone: deviceSync?.status === 'failed' ? 'warning' : 'success',
        text: deviceSync?.message ?? 'Device sync requested.',
      })
    } catch (error) {
      setNotice({ tone: 'error', text: getEmployeeErrorMessage(error, 'Could not sync the device.') })
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{profile.employmentStatus}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Employee Profile</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {profile.firstName} {profile.lastName} · {profile.employeeCode}
            {profile.department ? ` · ${profile.department}` : ''}
          </p>
        </div>
        {back}
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
        </EmployeeNotice>
      ) : null}
      <UnsupportedFieldsNotice changes={unsupported} />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Profile details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({server.documents.length})</TabsTrigger>
          <TabsTrigger value="device">Biometric device</TabsTrigger>
          <TabsTrigger value="activity">Activity history</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
              <CardDescription>
                {canEdit
                  ? 'Fields marked "Not saved to the server yet" stay on this screen only. Designation and department cannot be changed after registration.'
                  : 'View-only access for your role.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmployeeProfileForm
                value={form}
                onChange={setForm}
                readOnly={!canEdit || updateState.isLoading}
                unsupportedFields={UPDATE_UNSUPPORTED_FIELDS}
                statusOptions={SERVER_EMPLOYMENT_STATUSES}
              />
              {canEdit ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" disabled={updateState.isLoading} onClick={() => void save()}>
                    {updateState.isLoading ? 'Saving…' : 'Save Profile'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateState.isLoading}
                    onClick={() => {
                      setForm(toFormState(record.profile))
                      setUnsupported([])
                      setNotice(null)
                    }}
                  >
                    Discard changes
                  </Button>
                </div>
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
        <TabsContent value="documents" className="mt-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Employee documents</CardTitle>
              <CardDescription>
                Documents uploaded at registration. Adding or replacing documents later is not
                supported by the server yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {server.documents.length === 0 ? (
                <p className="text-sm text-text-secondary">No documents were uploaded.</p>
              ) : (
                <ul className="space-y-2">
                  {server.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border-soft px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-navy">{doc.label}</p>
                        <p className="text-xs text-text-secondary">
                          {doc.fileName}
                          {doc.uploadedAt ? ` · ${doc.uploadedAt}` : ''}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="gap-1">
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="device" className="mt-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Biometric device</CardTitle>
              <CardDescription>TimeWatch attendance device link for this employee.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-secondary">Device ID</dt>
                  <dd className="font-medium text-navy">{server.deviceId ?? 'Not linked'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Device user ID</dt>
                  <dd className="font-medium text-navy">{server.deviceUserId ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Sync status</dt>
                  <dd className="font-medium text-navy">{server.deviceSyncStatus}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Last synced</dt>
                  <dd className="font-medium text-navy">
                    {server.deviceSyncedAt ? new Date(server.deviceSyncedAt).toLocaleString() : '—'}
                  </dd>
                </div>
              </dl>
              {server.deviceSyncError ? (
                <EmployeeNotice tone="warning">Last error: {server.deviceSyncError}</EmployeeNotice>
              ) : null}
              <Feature name="employee.syncDevice">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={!server.deviceId || syncState.isLoading}
                  title={server.deviceId ? undefined : 'Link a device ID first'}
                  onClick={() => void sync()}
                >
                  <RefreshCw className="h-4 w-4" />
                  {syncState.isLoading ? 'Syncing…' : 'Sync to device'}
                </Button>
              </Feature>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Employee activity history</CardTitle>
              <CardDescription>
                Changes made in this session. The server does not provide an audit trail yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityList items={activity} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ActivityList({ items }: { items: EmployeeActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-text-secondary">No activity recorded yet.</p>
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl border border-border-soft px-4 py-3 text-sm">
          <p className="font-medium text-navy">{item.action}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {item.at} · {item.by}
          </p>
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Self-service: no /employees/me endpoint, so this stays on sample data.
// ---------------------------------------------------------------------------

function SampleOwnProfile() {
  const { canAccess } = useOptionalFeatureAccess()
  const initial = useMemo(() => structuredClone(employeeDirectoryMock[0]), [])
  const [profile, setProfile] = useState<EmployeeProfile>(initial)
  const [form, setForm] = useState<EmployeeProfileFormState>(() => toFormState(initial))
  const [note, setNote] = useState<string | null>(null)
  const canEdit = canAccess('employee.profile.own')

  const save = () => {
    if (!canEdit) return
    setProfile((prev) => ({
      ...prev,
      ...form,
      activityHistory: [sessionActivity('Profile saved (UI session)', 'Employee'), ...prev.activityHistory],
    }))
    setNote('Profile updated in UI session only. No self-service profile API is available yet.')
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="warning">Sample data</Badge>
          <Badge variant="secondary">{profile.employmentStatus}</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">My Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {profile.firstName} {profile.lastName} · {profile.employeeId} · {profile.department}
        </p>
      </div>

      {note ? <EmployeeNotice tone="warning">{note}</EmployeeNotice> : null}

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
                  ? 'Edit and save changes locally until a self-service API is available.'
                  : 'View-only access for your role.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmployeeProfileForm value={form} onChange={setForm} readOnly={!canEdit} />
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
              <ActivityList items={profile.activityHistory} />
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
