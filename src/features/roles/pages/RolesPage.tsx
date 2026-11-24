/**
 * Role Management: list / create / update / delete via production `/roles` APIs.
 * Authenticated only — no mock roles are shown.
 */
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Feature } from '@/features/rbac/components/Feature'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TablePagination } from '@/components/ui/table-pagination'
import { getApiErrorMessage } from '@/services/api/errors'

import { ROLES_PAGE_SIZE, useListRolesQuery } from '../api/rolesApi'
import type { BackendRole } from '../api/rolesApi.types'
import { CreateRoleDialog } from '../components/CreateRoleDialog'
import { DeleteRoleDialog } from '../components/DeleteRoleDialog'
import { EditRoleDialog } from '../components/EditRoleDialog'

const SEARCH_DEBOUNCE_MS = 350
const ALL = '__all__'

type Notice = { tone: 'success' | 'error'; text: string }

export function RolesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isActive, setIsActive] = useState<string>(ALL)
  const [isSystem, setIsSystem] = useState<string>(ALL)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BackendRole | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BackendRole | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const list = useListRolesQuery({
    page,
    limit: ROLES_PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(isActive === 'true' ? { isActive: true } : isActive === 'false' ? { isActive: false } : {}),
    ...(isSystem === 'true' ? { isSystem: true } : isSystem === 'false' ? { isSystem: false } : {}),
  })

  const items = list.data?.items ?? []
  const pagination = list.data?.pagination
  const totalPages = pagination?.totalPages ?? 0

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Role Management</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Custom and system roles from the HRMS API. System roles cannot be deleted or
            deactivated.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void list.refetch()}
            disabled={list.isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${list.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Feature name="roles.create">
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create role
            </Button>
          </Feature>
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className={
            notice.tone === 'success'
              ? 'rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900'
              : 'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
          }
        >
          {notice.text}
        </p>
      ) : null}

      <div className="grid gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <label className="relative block sm:col-span-2 lg:col-span-1">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">Search</span>
          <Search className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name or code"
          />
        </label>
        <div>
          <span className="mb-1.5 block text-xs font-medium text-slate-500">Status</span>
          <Select
            value={isActive}
            onValueChange={(value) => {
              setIsActive(value)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-medium text-slate-500">Type</span>
          <Select
            value={isSystem}
            onValueChange={(value) => {
              setIsSystem(value)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              <SelectItem value="true">System</SelectItem>
              <SelectItem value="false">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        {list.isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : list.isError ? (
          <div className="space-y-3 p-6">
            <p role="alert" className="text-sm text-red-600">
              {getApiErrorMessage(list.error, 'Could not load roles.')}
            </p>
            <Button type="button" variant="outline" onClick={() => void list.refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No roles match these filters.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Users</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="align-middle font-medium text-navy">
                    <div className="flex flex-wrap items-center gap-2">
                      {row.name}
                      {row.isSystem ? <Badge variant="secondary">System</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    <code className="text-xs text-slate-600">{row.code}</code>
                  </TableCell>
                  <TableCell className="hidden max-w-[240px] truncate align-middle text-slate-600 md:table-cell">
                    {row.description || '—'}
                  </TableCell>
                  <TableCell className="align-middle">
                    <Badge variant={row.isActive ? 'success' : 'secondary'}>
                      {row.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden align-middle sm:table-cell">
                    {row.userCount}
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="inline-flex items-center justify-center gap-1">
                      <Feature name="roles.update">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-label={`Edit ${row.name}`}
                          onClick={() => setEditTarget(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Feature>
                      <Feature name="roles.delete">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          aria-label={`Delete ${row.name}`}
                          disabled={row.isSystem || row.userCount > 0}
                          title={
                            row.isSystem
                              ? 'System roles cannot be deleted'
                              : row.userCount > 0
                                ? 'Remove user assignments first'
                                : 'Delete role'
                          }
                          onClick={() => setDeleteTarget(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Feature>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination && totalPages > 0 ? (
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={pagination.total}
          itemLabel="roles"
          disabled={list.isFetching}
          onPageChange={setPage}
        />
      ) : null}

      <CreateRoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(role) => {
          setNotice({ tone: 'success', text: `Created role ${role.name} (${role.code}).` })
          setPage(1)
        }}
      />
      <EditRoleDialog
        role={editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
        onUpdated={(role) => {
          setNotice({ tone: 'success', text: `Updated role ${role.name}.` })
          setEditTarget(null)
        }}
      />
      <DeleteRoleDialog
        role={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onDeleted={(role) => {
          setNotice({ tone: 'success', text: `Deleted role ${role.name}.` })
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
