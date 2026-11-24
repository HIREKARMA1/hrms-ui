/**
 * Permission Management catalogue: `GET /permissions` (permissions:read).
 * Informational only — does not grant access. Session RBAC still uses /auth/me.
 */
import { RefreshCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

import { PERMISSIONS_PAGE_SIZE, useListPermissionsQuery } from '../api/permissionsApi'

const SEARCH_DEBOUNCE_MS = 350

export function PermissionsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [moduleInput, setModuleInput] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setModuleFilter(moduleInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput, moduleInput])

  const list = useListPermissionsQuery({
    page,
    limit: PERMISSIONS_PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(moduleFilter ? { module: moduleFilter } : {}),
  })

  const items = list.data?.items ?? []
  const pagination = list.data?.pagination
  const totalPages = pagination?.totalPages ?? 0

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Permission Management</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Catalogue of API permission codes from the HRMS server. Listing these codes does not
            change your access; your session permissions still come from sign-in / profile.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void list.refetch()}
          disabled={list.isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${list.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="relative block">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">
            Search code or description
          </span>
          <Search className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="e.g. users:read"
            maxLength={120}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">Module filter</span>
          <Input
            value={moduleInput}
            onChange={(event) => setModuleInput(event.target.value)}
            placeholder="e.g. users"
            maxLength={64}
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        {list.isLoading ? (
          <div className="space-y-3 p-4" data-testid="permissions-loading">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : list.isError ? (
          <div className="space-y-3 p-6" data-testid="permissions-error">
            <p role="alert" className="text-sm text-red-600">
              {getApiErrorMessage(list.error, 'Could not load permissions.')}
            </p>
            <Button type="button" variant="outline" onClick={() => void list.refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p
            className="p-8 text-center text-sm text-slate-500"
            data-testid="permissions-empty"
          >
            No permissions match these filters.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Module</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <code className="text-xs font-medium text-navy">{row.code}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.module}</Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-[320px] truncate text-slate-600 md:table-cell">
                    {row.description || '—'}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">
                    {row.roleCount}
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
          itemLabel="permissions"
          disabled={list.isFetching}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
