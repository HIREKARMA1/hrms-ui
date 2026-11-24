import { ExternalLink, RefreshCw } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ToastBanner, useToast } from '@/hooks/useToast'

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
  buildDeviceLinkUpdatePayload,
  buildUpdatePayload,
  deviceLinkFromServer,
  SERVER_EMPLOYMENT_STATUSES,
  toFormState,
  type EmployeeDeviceLinkFormState,
  type EmployeeRecord,
} from '../api/employeeMappers'
import {
  getEmployeeErrorMessage,
  useGetEmployeeQuery,
  useSyncEmployeeDeviceMutation,
  useUpdateEmployeeMutation,
} from '../api/employeesApi'
import type { DeviceSyncOutcome } from '../api/employeeApi.types'
import { CreateEmployeeLoginPanel } from '../components/CreateEmployeeLoginPanel'
import { EmployeeBiometricAttendanceCard } from '../components/EmployeeBiometricAttendanceCard'
import { EmployeeBiometricLinkEditor } from '../components/EmployeeBiometricLinkEditor'
import { EmployeeNotice } from '../components/EmployeeNotice'
import { EmployeeProfileForm } from '../components/EmployeeProfileForm'
import { employeeDirectoryMock } from '../mocks/employeeDirectory.mock'
import type {
  EmployeeActivityItem,
  EmployeeProfile,
  EmployeeProfileFormState,
} from '../types/employeeProfile.types'
import { isNotFoundError } from '../utils/queryViewState'
import { validateEmployeeUpdate } from '../validation/employeeForm.schema'

type EmployeeProfilePageProps = {
  /** When set, forces own-profile mode for employee self-service. */
  ownProfile?: boolean
  employeeIdParam?: string
}

type Notice = { tone: 'success' | 'warning'; text: string }

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
  const prefix = rbac?.routePrefix ?? '/manager'
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
  const { message, tone, toast } = useToast(6000)
  const [form, setForm] = useState<EmployeeProfileFormState>(() => toFormState(record.profile))
  const [notice, setNotice] = useState<Notice | null>(null)
  const [activity, setActivity] = useState<EmployeeActivityItem[]>([])
  const [updateEmployee, updateState] = useUpdateEmployeeMutation()
  const [syncDevice, syncState] = useSyncEmployeeDeviceMutation()
  const { profile } = record
  const [serverView, setServerView] = useState(record.server)
  const [deviceLink, setDeviceLink] = useState<EmployeeDeviceLinkFormState>(() =>
    deviceLinkFromServer(record.server),
  )
  const [deviceSaveState, setDeviceSaveState] = useState(false)
  const updateValidation = useMemo(() => validateEmployeeUpdate(form), [form])
  const canSubmit = updateValidation.ok

  const save = async () => {
    if (!canEdit) return
    const validation = validateEmployeeUpdate(form)
    if (!validation.ok) {
      toast(validation.errors.join(' · '), 'error')
      return
    }
    const result = buildUpdatePayload(form, record)
    if (result.errors.length > 0) {
      toast(result.errors.join(' · '), 'error')
      return
    }
    if (Object.keys(result.body).length === 0) {
      const emptyMessage = 'No changes to save.'
      toast(emptyMessage, 'default')
      setNotice({ tone: 'success', text: emptyMessage })
      return
    }
    setNotice(null)
    try {
      const { deviceSync, record: updated } = await updateEmployee({
        id: serverView.id,
        body: result.body,
      }).unwrap()
      setServerView(updated.server)
      setDeviceLink(deviceLinkFromServer(updated.server))
      setActivity((prev) => [sessionActivity('Profile saved', 'You (this session)'), ...prev])
      const savedText = `Profile saved.${deviceSyncText(deviceSync)}`
      setNotice({
        tone: deviceSync?.status === 'failed' ? 'warning' : 'success',
        text: savedText,
      })
      toast(savedText, deviceSync?.status === 'failed' ? 'warning' : 'success')
    } catch (error) {
      toast(getEmployeeErrorMessage(error, 'Could not save the profile.'), 'error')
    }
  }

  const saveDeviceLink = async () => {
    if (!canEdit) return
    const result = buildDeviceLinkUpdatePayload(deviceLink, serverView)
    if (result.errors.length > 0) {
      toast(result.errors.join(' · '), 'error')
      return
    }
    if (Object.keys(result.body).length === 0) {
      toast('No changes to the biometric link.', 'default')
      return
    }
    setNotice(null)
    setDeviceSaveState(true)
    try {
      const { record: updated, deviceSync } = await updateEmployee({
        id: serverView.id,
        body: result.body,
      }).unwrap()
      setServerView(updated.server)
      setDeviceLink(deviceLinkFromServer(updated.server))
      setActivity((prev) => [sessionActivity('Biometric link saved', 'You (this session)'), ...prev])
      const savedText = `Biometric link saved.${deviceSyncText(deviceSync)}`
      setNotice({
        tone: deviceSync?.status === 'failed' ? 'warning' : 'success',
        text: savedText,
      })
      toast(savedText, deviceSync?.status === 'failed' ? 'warning' : 'success')
    } catch (error) {
      toast(getEmployeeErrorMessage(error, 'Could not save biometric link.'), 'error')
    } finally {
      setDeviceSaveState(false)
    }
  }

  const sync = async () => {
    setNotice(null)
    try {
      const { deviceSync, record: updated } = await syncDevice({ id: serverView.id, mode: 'push' }).unwrap()
      setServerView(updated.server)
      setDeviceLink(deviceLinkFromServer(updated.server))
      setActivity((prev) => [sessionActivity('Synced to biometric device', 'You (this session)'), ...prev])
      const syncText = deviceSync?.message ?? 'Device sync requested.'
      setNotice({
        tone: deviceSync?.status === 'failed' ? 'warning' : 'success',
        text: syncText,
      })
      toast(syncText, deviceSync?.status === 'failed' ? 'warning' : 'success')
    } catch (error) {
      toast(getEmployeeErrorMessage(error, 'Could not sync the device.'), 'error')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <ToastBanner message={message} tone={tone} />
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

      {notice ? <EmployeeNotice tone={notice.tone}>{notice.text}</EmployeeNotice> : null}

      {!serverView.hasLoginAccount ? (
        <CreateEmployeeLoginPanel
          employeeId={serverView.id}
          defaultEmail={profile.workEmail}
          employeeLabel={`${profile.firstName} ${profile.lastName}`}
          onCreated={() =>
            setServerView((prev) => ({ ...prev, hasLoginAccount: true }))
          }
        />
      ) : null}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Profile details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({serverView.documents.length})</TabsTrigger>
          <TabsTrigger value="device">Biometric device</TabsTrigger>
          <TabsTrigger value="activity">Activity history</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
              <CardDescription>
                {canEdit
                  ? 'Fields marked with * are required. Designation cannot be changed after registration.'
                  : 'View-only access for your role.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmployeeProfileForm
                value={form}
                onChange={setForm}
                readOnly={!canEdit || updateState.isLoading}
                mode="update"
                statusOptions={SERVER_EMPLOYMENT_STATUSES}
              />
              {canEdit ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    disabled={updateState.isLoading || !canSubmit}
                    onClick={() => void save()}
                  >
                    {updateState.isLoading ? 'Saving…' : 'Save Profile'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateState.isLoading}
                    onClick={() => {
                      setForm(toFormState(record.profile))
                      setNotice(null)
                    }}
                  >
                    Discard changes
                  </Button>
                  {!canSubmit ? (
                    <p className="text-xs text-text-secondary">
                      Fill all required fields (*) to enable Save.
                    </p>
                  ) : null}
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
              {serverView.documents.length === 0 ? (
                <p className="text-sm text-text-secondary">No documents were uploaded.</p>
              ) : (
                <ul className="space-y-2">
                  {serverView.documents.map((doc) => (
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
        <TabsContent value="device" className="mt-4 space-y-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Biometric device</CardTitle>
              <CardDescription>TimeWatch attendance device link for this employee.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {canEdit ? (
                <EmployeeBiometricLinkEditor
                  value={deviceLink}
                  onChange={setDeviceLink}
                  disabled={deviceSaveState || updateState.isLoading}
                  saving={deviceSaveState}
                  onSave={() => void saveDeviceLink()}
                />
              ) : (
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-text-secondary">Device ID</dt>
                    <dd className="font-medium text-navy">{serverView.deviceId ?? 'Not linked'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-text-secondary">Device user ID</dt>
                    <dd className="font-medium text-navy">{serverView.deviceUserId ?? '—'}</dd>
                  </div>
                </dl>
              )}
              <dl className="grid gap-3 sm:grid-cols-2 border-t border-border-soft pt-4">
                <div>
                  <dt className="text-xs text-text-secondary">Sync status</dt>
                  <dd className="font-medium text-navy">{serverView.deviceSyncStatus}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Last synced</dt>
                  <dd className="font-medium text-navy">
                    {serverView.deviceSyncedAt
                      ? new Date(serverView.deviceSyncedAt).toLocaleString()
                      : '—'}
                  </dd>
                </div>
              </dl>
              {serverView.deviceSyncError ? (
                <EmployeeNotice tone="warning">Last error: {serverView.deviceSyncError}</EmployeeNotice>
              ) : null}
              <Feature name="employee.syncDevice">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={!serverView.deviceId || syncState.isLoading}
                  title={serverView.deviceId ? undefined : 'Save a device ID first'}
                  onClick={() => void sync()}
                >
                  <RefreshCw className="h-4 w-4" />
                  {syncState.isLoading ? 'Syncing…' : 'Sync to device'}
                </Button>
              </Feature>
            </CardContent>
          </Card>
          <Feature name="attendance.biometric.attendanceRead">
            <EmployeeBiometricAttendanceCard employeeId={serverView.id} />
          </Feature>
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
