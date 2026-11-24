/**
 * User Management: list, register, view, update, deactivate via `/users` APIs.
 * Authenticated only — no mock users are shown.
 */
import { Eye, Plus, RefreshCw, Search, UserX } from 'lucide-react'
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
import { getApiErrorMessage } from '@/services/api/errors'

import { USERS_PAGE_SIZE, useListUsersQuery } from '../api/usersApi'
import type { BackendUser, BackendUserRole } from '../api/usersApi.types'
import { CreateUserDialog } from '../components/CreateUserDialog'
import { DeactivateUserDialog } from '../components/DeactivateUserDialog'
import { UserDetailDialog } from '../components/UserDetailDialog'

const SEARCH_DEBOUNCE_MS = 350
const ALL = '__all__'

type Notice = { tone: 'success' | 'error'; text: string }

const LEGACY_ROLES: BackendUserRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']

export function UsersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [role, setRole] = useState<string>(ALL)
  const [isActive, setIsActive] = useState<string>(ALL)
  const [roleCode, setRoleCode] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<BackendUser | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const list = useListUsersQuery({
    page,
    limit: USERS_PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(role !== ALL ? { role: role as BackendUserRole } : {}),
    ...(isActive === 'true' ? { isActive: true } : isActive === 'false' ? { isActive: false } : {}),
    ...(roleCode.trim() ? { roleCode: roleCode.trim() } : {}),
  })

  const items = list.data?.items ?? []
  const pagination = list.data?.pagination
  const totalPages = pagination?.totalPages ?? 0

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">User Management</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Accounts from the HRMS API. New users start as EMPLOYEE; Admin/HR roles are assigned
            separately when permitted.
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
          <Feature name="users.create">
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Register user
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

      <div className="grid gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">Search email</span>
          <Search className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by email"
            className="pl-9"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">Legacy role</span>
          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              {LEGACY_ROLES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="block">
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
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="block sm:col-span-2 lg:col-span-4">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">
            Dynamic role code (optional)
          </span>
          <Input
            value={roleCode}
            onChange={(event) => {
              setRoleCode(event.target.value.toUpperCase())
              setPage(1)
            }}
            placeholder="e.g. HR_ADMIN"
          />
        </label>
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
              {getApiErrorMessage(list.error, 'Could not load users.')}
            </p>
            <Button type="button" variant="outline" onClick={() => void list.refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No users match these filters.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Legacy role</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-navy">{row.email}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.roles.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        row.roles.map((assigned) => (
                          <Badge key={assigned.id} variant="secondary">
                            {assigned.code}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.isActive ? 'success' : 'secondary'}>
                      {row.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${row.email}`}
                        onClick={() => setDetailId(row.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Feature name="users.deactivate">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Deactivate ${row.email}`}
                          onClick={() => setDeactivateTarget(row)}
                        >
                          <UserX className="h-4 w-4" />
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
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <p>
            Page {pagination.page} of {totalPages} · {pagination.total} users
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || list.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages || list.isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(user, detail) => {
          setNotice({ tone: 'success', text: `${detail} (${user.email})` })
          setDetailId(user.id)
        }}
      />

      <UserDetailDialog
        userId={detailId}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        onUpdated={(user) => {
          setNotice({ tone: 'success', text: `Updated ${user.email}.` })
        }}
        onRequestDeactivate={(user) => setDeactivateTarget(user)}
      />

      <DeactivateUserDialog
        user={deactivateTarget}
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null)
        }}
        onDeactivated={(user, message) => {
          setNotice({ tone: 'success', text: `${message} (${user.email})` })
          setDeactivateTarget(null)
        }}
      />
    </div>
  )
}

export default UsersPage
