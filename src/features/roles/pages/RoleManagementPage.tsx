import { Plus, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ToastBanner, useToast } from '@/hooks/useToast'
import { getApiErrorMessage } from '@/services/api/errors'

import { useListAllPermissionsQuery } from '../api/permissionsApi'
import {
  useAssignRolePermissionsMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useListRolesQuery,
  useUpdateRoleMutation,
} from '../api/rolesApi'
import { RoleDeleteDialog } from '../components/RoleDeleteDialog'
import { RoleFormDrawer } from '../components/RoleFormDrawer'
import { RoleSummaryCards } from '../components/RoleSummaryCards'
import { RolesFilterBar } from '../components/RolesFilterBar'
import { RolesTable } from '../components/RolesTable'
import { RoleViewDialog } from '../components/RoleViewDialog'
import type {
  ManagedRole,
  RoleFormValues,
  RolePermissionId,
  RoleTypeFilter,
} from '../types/roleManagement.types'
import { mapPermissionsToModules } from '../utils/mapPermissionsToModules'
import { toManagedRole, toRoleCode } from '../utils/toManagedRole'

const PAGE_SIZE = 5
const SEARCH_DEBOUNCE_MS = 350
const CREATE_DRAFT_KEY = '__create__'
const EMPTY_FORM: RoleFormValues = {
  name: '',
  description: '',
  permissionIds: [],
}

type RoleFormDraft = {
  form: RoleFormValues
  permissionsDirty: boolean
}

export function RoleManagementPage() {
  const { message, toast } = useToast()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<RoleTypeFilter>('all')
  const [page, setPage] = useState(1)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
  const [editingRole, setEditingRole] = useState<ManagedRole | null>(null)
  const [form, setForm] = useState<RoleFormValues>(EMPTY_FORM)
  const [permissionsDirty, setPermissionsDirty] = useState(false)
  const [formDrafts, setFormDrafts] = useState<Record<string, RoleFormDraft>>(
    {},
  )
  const [permissionCache, setPermissionCache] = useState<
    Record<string, RolePermissionId[]>
  >({})

  const [viewRole, setViewRole] = useState<ManagedRole | null>(null)
  const [deleteRole, setDeleteRole] = useState<ManagedRole | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const listArgs = {
    page,
    limit: PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(typeFilter === 'all'
      ? {}
      : { isSystem: typeFilter === 'system' }),
  }

  const rolesQuery = useListRolesQuery(listArgs)
  const totalCountQuery = useListRolesQuery({ page: 1, limit: 1 })
  const systemCountQuery = useListRolesQuery({
    page: 1,
    limit: 1,
    isSystem: true,
  })
  const customCountQuery = useListRolesQuery({
    page: 1,
    limit: 1,
    isSystem: false,
  })
  const permissionsQuery = useListAllPermissionsQuery()

  const [createRole, createState] = useCreateRoleMutation()
  const [updateRole, updateState] = useUpdateRoleMutation()
  const [deleteRoleMutation, deleteState] = useDeleteRoleMutation()
  const [assignPermissions, assignState] = useAssignRolePermissionsMutation()

  const submitting =
    createState.isLoading ||
    updateState.isLoading ||
    assignState.isLoading

  const permissionModules = useMemo(
    () => mapPermissionsToModules(permissionsQuery.data ?? []),
    [permissionsQuery.data],
  )

  const roles: ManagedRole[] = useMemo(
    () =>
      (rolesQuery.data?.items ?? []).map((role) =>
        toManagedRole(role, permissionCache[role.id] ?? []),
      ),
    [rolesQuery.data?.items, permissionCache],
  )

  const summary = {
    total: totalCountQuery.data?.pagination.total ?? 0,
    system: systemCountQuery.data?.pagination.total ?? 0,
    custom: customCountQuery.data?.pagination.total ?? 0,
  }

  const pagination = rolesQuery.data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1)
  const safePage = Math.min(page, Math.max(totalPages, 1))

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const cachePermissions = (roleId: string, permissionIds: RolePermissionId[]) => {
    setPermissionCache((prev) => ({ ...prev, [roleId]: permissionIds }))
  }

  const draftKeyFor = (mode: 'create' | 'edit', roleId?: string | null) =>
    mode === 'edit' && roleId ? roleId : CREATE_DRAFT_KEY

  const clearDraft = (key: string) => {
    setFormDrafts((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const closeDrawerUi = () => {
    setDrawerOpen(false)
    setEditingRole(null)
    setForm(EMPTY_FORM)
    setPermissionsDirty(false)
    setDrawerMode('create')
  }

  /** Accidental outside / X close — keep draft so Edit can restore it. */
  const dismissDrawerKeepDraft = () => {
    if (submitting) return
    const key = draftKeyFor(drawerMode, editingRole?.id)
    setFormDrafts((prev) => ({
      ...prev,
      [key]: {
        form: {
          name: form.name,
          description: form.description,
          permissionIds: [...form.permissionIds],
        },
        permissionsDirty,
      },
    }))
    closeDrawerUi()
  }

  /** Cancel or successful save — drop the draft. */
  const closeDrawerDiscardDraft = () => {
    clearDraft(draftKeyFor(drawerMode, editingRole?.id))
    closeDrawerUi()
  }

  const openCreate = () => {
    const draft = formDrafts[CREATE_DRAFT_KEY]
    setDrawerMode('create')
    setEditingRole(null)
    if (draft) {
      setForm(draft.form)
      setPermissionsDirty(draft.permissionsDirty)
    } else {
      setForm(EMPTY_FORM)
      setPermissionsDirty(true)
    }
    setDrawerOpen(true)
  }

  const openEdit = (role: ManagedRole) => {
    const latest = roles.find((item) => item.id === role.id) ?? role
    const draft = formDrafts[latest.id]
    const cached = permissionCache[latest.id] ?? latest.permissionIds
    setDrawerMode('edit')
    setEditingRole(latest)
    if (draft) {
      setForm(draft.form)
      setPermissionsDirty(draft.permissionsDirty)
    } else {
      setForm({
        name: latest.isSystem ? latest.code : latest.name,
        description: latest.description,
        permissionIds: [...cached],
      })
      setPermissionsDirty(false)
    }
    setDrawerOpen(true)
  }

  const handleFormChange = (values: RoleFormValues) => {
    setForm((prev) => {
      if (
        prev.permissionIds.length !== values.permissionIds.length ||
        prev.permissionIds.some((id, index) => id !== values.permissionIds[index])
      ) {
        setPermissionsDirty(true)
      }
      return values
    })
  }

  const handleTypeFilterChange = (value: RoleTypeFilter) => {
    setTypeFilter(value)
    setPage(1)
  }

  const saveRole = async () => {
    const trimmedName = form.name.trim()
    if (!trimmedName) return

    try {
      if (drawerMode === 'create') {
        const code = toRoleCode(trimmedName)
        if (!code || code.length < 2) {
          toast('Role name must produce a valid UPPER_SNAKE_CASE code.')
          return
        }

        const created = await createRole({
          code,
          name: trimmedName,
          description: form.description.trim() || undefined,
        }).unwrap()

        if (form.permissionIds.length > 0) {
          const withPermissions = await assignPermissions({
            id: created.id,
            body: { permissionIds: form.permissionIds },
          }).unwrap()
          cachePermissions(
            created.id,
            withPermissions.permissions.map((permission) => permission.id),
          )
        } else {
          cachePermissions(created.id, [])
        }

        toast('Role created successfully.')
        closeDrawerDiscardDraft()
        setPage(1)
        return
      }

      if (!editingRole) return

      const patchBody =
        editingRole.isSystem
          ? {
              description: form.description.trim() || null,
            }
          : {
              name: trimmedName,
              description: form.description.trim() || null,
            }

      await updateRole({
        id: editingRole.id,
        body: patchBody,
      }).unwrap()

      if (permissionsDirty) {
        if (editingRole.code === 'SUPER_ADMIN') {
          toast(
            'Role details saved. SUPER_ADMIN permissions cannot be changed via API.',
          )
          closeDrawerDiscardDraft()
          return
        }

        const withPermissions = await assignPermissions({
          id: editingRole.id,
          body: { permissionIds: form.permissionIds },
        }).unwrap()
        cachePermissions(
          editingRole.id,
          withPermissions.permissions.map((permission) => permission.id),
        )
      }

      toast('Role updated successfully.')
      closeDrawerDiscardDraft()
    } catch (error) {
      toast(getApiErrorMessage(error, 'Could not save the role.'))
    }
  }

  const confirmDelete = async () => {
    if (!deleteRole || deleteRole.isSystem || deleteRole.userCount > 0) return
    try {
      await deleteRoleMutation(deleteRole.id).unwrap()
      setPermissionCache((prev) => {
        const next = { ...prev }
        delete next[deleteRole.id]
        return next
      })
      clearDraft(deleteRole.id)
      setDeleteRole(null)
      toast('Role deleted successfully.')
      setPage(1)
    } catch (error) {
      toast(getApiErrorMessage(error, 'Could not delete the role.'))
    }
  }

  const listError = rolesQuery.isError
    ? getApiErrorMessage(rolesQuery.error, 'Could not load roles.')
    : null

  const permissionsHint =
    drawerMode === 'edit' && !permissionsDirty && form.permissionIds.length === 0
      ? 'Changing permissions replaces the full set for this role. Current assignments are applied when you save a new selection.'
      : drawerMode === 'edit' && permissionsDirty
        ? 'Selected permissions will replace the role\'s current permission set.'
        : null

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <ToastBanner message={message} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium text-text-secondary">
            Super Admin &gt; Role Management
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Role Management
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage roles and control access across your organization.
          </p>
        </div>
        <Button
          type="button"
          className="w-full shrink-0 gap-2 sm:w-auto"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      <RoleSummaryCards
        totalRoles={summary.total}
        systemRoles={summary.system}
        customRoles={summary.custom}
      />

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border-soft px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-navy">All Roles</h2>
            {rolesQuery.isFetching && !rolesQuery.isLoading ? (
              <p className="mt-0.5 text-xs text-text-secondary">Updating…</p>
            ) : null}
          </div>
          <RolesFilterBar
            search={search}
            onSearchChange={setSearch}
            typeFilter={typeFilter}
            onTypeFilterChange={handleTypeFilterChange}
          />
        </div>

        {listError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <p className="text-sm text-rose-700">{listError}</p>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => void rolesQuery.refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : rolesQuery.isLoading ? (
          <div className="px-6 py-12 text-center text-sm text-text-secondary">
            Loading roles…
          </div>
        ) : (
          <RolesTable
            roles={roles}
            page={safePage}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            onView={(role) =>
              setViewRole({
                ...role,
                permissionIds: permissionCache[role.id] ?? role.permissionIds,
              })
            }
            onEdit={openEdit}
            onDelete={setDeleteRole}
          />
        )}
      </div>

      <RoleFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        values={form}
        modules={permissionModules}
        permissionsLoading={permissionsQuery.isLoading}
        nameReadOnly={editingRole?.isSystem === true}
        submitting={submitting}
        permissionsHint={permissionsHint}
        onDismiss={dismissDrawerKeepDraft}
        onCancel={closeDrawerDiscardDraft}
        onChange={handleFormChange}
        onSubmit={() => void saveRole()}
      />

      <RoleViewDialog
        role={viewRole}
        modules={permissionModules}
        permissionsLoading={permissionsQuery.isLoading}
        open={Boolean(viewRole)}
        onOpenChange={(open) => {
          if (!open) setViewRole(null)
        }}
        onEdit={openEdit}
      />

      <RoleDeleteDialog
        role={deleteRole}
        open={Boolean(deleteRole)}
        submitting={deleteState.isLoading}
        onOpenChange={(open) => {
          if (!open && !deleteState.isLoading) setDeleteRole(null)
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
