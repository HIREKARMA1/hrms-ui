/**
 * GET /users/:id detail with optional PATCH update. Refetches when the id
 * changes so stale data from a previous user is not shown.
 */
import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Feature } from '@/features/rbac/components/Feature'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  getUserErrorMessage,
  useGetUserQuery,
  useRemoveUserRoleMutation,
  useUpdateUserMutation,
} from '../api/usersApi'
import type { BackendUser } from '../api/usersApi.types'
import { validateUpdateUserForm, type UpdateUserFormErrors } from '../utils/userFormValidation'

type UserDetailDialogProps = {
  userId: string | null
  onOpenChange: (open: boolean) => void
  onUpdated: (user: BackendUser) => void
  onRequestDeactivate: (user: BackendUser) => void
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function UserEditForm({
  user,
  onUpdated,
  onRequestDeactivate,
  onClose,
}: {
  user: BackendUser
  onUpdated: (user: BackendUser) => void
  onRequestDeactivate: (user: BackendUser) => void
  onClose: () => void
}) {
  const [updateUser, updateState] = useUpdateUserMutation()
  const [removeUserRole, removeRoleState] = useRemoveUserRoleMutation()
  const [email, setEmail] = useState(user.email)
  const [employeeId, setEmployeeId] = useState(user.employeeId ?? '')
  const [clearEmployee, setClearEmployee] = useState(false)
  const [errors, setErrors] = useState<UpdateUserFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [pendingRemoveRoleId, setPendingRemoveRoleId] = useState<string | null>(null)

  const handleRemoveRole = async (roleId: string, roleCode: string) => {
    if (removeRoleState.isLoading) return
    const confirmed = window.confirm(
      `Remove role ${roleCode} from this user? This cannot be undone from the UI without re-assigning.`,
    )
    if (!confirmed) return
    setRoleError(null)
    setPendingRemoveRoleId(roleId)
    try {
      const updated = await removeUserRole({ id: user.id, roleId }).unwrap()
      onUpdated(updated)
    } catch (error) {
      setRoleError(getUserErrorMessage(error, 'Could not remove this role.'))
    } finally {
      setPendingRemoveRoleId(null)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const nextErrors = validateUpdateUserForm({
      email,
      employeeId,
      clearEmployee,
      originalEmail: user.email,
      originalEmployeeId: user.employeeId,
    })
    if (nextErrors.email || nextErrors.form) {
      setErrors(nextErrors)
      return
    }
    setErrors({})

    const body: { email?: string; employeeId?: string | null } = {}
    const nextEmail = email.trim()
    if (nextEmail !== user.email) body.email = nextEmail
    const nextEmployeeId = clearEmployee ? null : employeeId.trim() || null
    if (nextEmployeeId !== user.employeeId) body.employeeId = nextEmployeeId

    try {
      const updated = await updateUser({ id: user.id, body }).unwrap()
      onUpdated(updated)
    } catch (error) {
      setFormError(getUserErrorMessage(error, 'Could not update this user.'))
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={user.isActive ? 'success' : 'secondary'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant="outline">{user.role}</Badge>
        {user.roles.map((role) => (
          <Badge key={role.id} variant="secondary">
            {role.code}
          </Badge>
        ))}
      </div>

      <Feature name="users.assignRoles">
        <div className="space-y-2 rounded-xl border border-slate-100 p-4">
          <p className="text-sm font-medium text-navy">Assigned roles</p>
          <p className="text-xs text-slate-500">
            Removing a role is confirmed before it is sent to the server.
          </p>
          {user.roles.length === 0 ? (
            <p className="text-sm text-slate-500">No dynamic roles assigned.</p>
          ) : (
            <ul className="space-y-2">
              {user.roles.map((role) => (
                <li
                  key={role.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-navy">
                    {role.name}{' '}
                    <span className="font-normal text-slate-500">({role.code})</span>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    disabled={removeRoleState.isLoading}
                    onClick={() => void handleRemoveRole(role.id, role.code)}
                  >
                    {pendingRemoveRoleId === role.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        Removing...
                      </>
                    ) : (
                      'Remove'
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {roleError ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {roleError}
            </p>
          ) : null}
        </div>
      </Feature>

      <dl className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">User id</dt>
          <dd className="break-all font-medium text-navy">{user.id}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Last login</dt>
          <dd>{formatDate(user.lastLoginAt)}</dd>
        </div>
        {user.employee ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Linked employee</dt>
            <dd>
              {user.employee.firstName} {user.employee.lastName} ({user.employee.employeeCode})
            </dd>
          </div>
        ) : null}
      </dl>

      <Feature name="users.update">
        <div className="space-y-4 rounded-xl border border-slate-100 p-4">
          <p className="text-sm font-medium text-navy">Update profile</p>
          <div className="space-y-2">
            <Label htmlFor="update-user-email">Email</Label>
            <Input
              id="update-user-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
            />
            {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-user-employee">Employee ID</Label>
            <Input
              id="update-user-employee"
              value={clearEmployee ? '' : employeeId}
              disabled={clearEmployee}
              onChange={(event) => setEmployeeId(event.target.value)}
              placeholder="Leave blank to keep unchanged"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={clearEmployee}
                onChange={(event) => setClearEmployee(event.target.checked)}
              />
              Unlink employee
            </label>
          </div>
          {errors.form ? <p className="text-xs text-red-500">{errors.form}</p> : null}
          {formError ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </p>
          ) : null}
          <Button type="submit" disabled={updateState.isLoading}>
            {updateState.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </Feature>

      <Feature name="users.deactivate">
        <Button
          type="button"
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => onRequestDeactivate(user)}
        >
          Deactivate user
        </Button>
      </Feature>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </form>
  )
}

export function UserDetailDialog({
  userId,
  onOpenChange,
  onUpdated,
  onRequestDeactivate,
}: UserDetailDialogProps) {
  const open = Boolean(userId)
  const detail = useGetUserQuery(userId ?? '', {
    skip: !userId,
    // Always refetch when opening a different id; do not reuse a previous user's cache as the form seed.
    refetchOnMountOrArgChange: true,
  })

  const user = detail.data
  const notFound = detail.isError && (detail.error as { status?: unknown })?.status === 404

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
          <DialogDescription>
            Loaded from the server for this user id. Email and employee link update here; role
            removal requires assign-roles permission; active status uses deactivate.
          </DialogDescription>
        </DialogHeader>

        {!userId ? null : detail.isLoading || (detail.isFetching && !user) ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : notFound ? (
          <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            User not found.
          </p>
        ) : detail.isError ? (
          <div className="space-y-3">
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {getApiErrorMessage(detail.error, 'Could not load this user.')}
            </p>
            <Button type="button" variant="outline" onClick={() => void detail.refetch()}>
              Retry
            </Button>
          </div>
        ) : user ? (
          <UserEditForm
            key={`${user.id}:${user.updatedAt}`}
            user={user}
            onUpdated={onUpdated}
            onRequestDeactivate={onRequestDeactivate}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
