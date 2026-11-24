import { RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ToastBanner, useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  useListPermissionsCatalogQuery,
  useListPermissionsQuery,
} from '../api/permissionsApi'
import { PermissionDetailsDrawer } from '../components/PermissionDetailsDrawer'
import { PermissionSummaryCards } from '../components/PermissionSummaryCards'
import { PermissionsFilterBar } from '../components/PermissionsFilterBar'
import { PermissionsTable } from '../components/PermissionsTable'
import type { ManagedPermission } from '../types/permissionManagement.types'
import {
  getPermissionModules,
  toManagedPermission,
} from '../utils/toManagedPermission'

const PAGE_SIZE = 8

export function PermissionManagementPage() {
  const { message, toast } = useToast()

  const [draftSearch, setDraftSearch] = useState('')
  const [draftModule, setDraftModule] = useState('all')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedModule, setAppliedModule] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedPermission, setSelectedPermission] =
    useState<ManagedPermission | null>(null)

  const listArgs = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(appliedSearch.trim() ? { search: appliedSearch.trim() } : {}),
      ...(appliedModule !== 'all' ? { module: appliedModule } : {}),
    }),
    [appliedModule, appliedSearch, page],
  )

  const listQuery = useListPermissionsQuery(listArgs)
  const catalogQuery = useListPermissionsCatalogQuery()

  const permissions = useMemo(
    () => (listQuery.data?.items ?? []).map(toManagedPermission),
    [listQuery.data?.items],
  )

  const catalog = useMemo(
    () => (catalogQuery.data ?? []).map(toManagedPermission),
    [catalogQuery.data],
  )

  const modules = useMemo(() => getPermissionModules(catalog), [catalog])

  const summary = useMemo(() => {
    const usedInRoles = catalog.filter((item) => item.roleCount > 0).length
    return {
      total: catalog.length,
      usedInRoles,
      unused: catalog.length - usedInRoles,
    }
  }, [catalog])

  const pagination = listQuery.data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1)
  const safePage = Math.min(page, Math.max(totalPages, 1))

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const applyFilters = () => {
    setAppliedSearch(draftSearch)
    setAppliedModule(draftModule)
    setPage(1)
  }

  const handleRefresh = async () => {
    setSelectedPermission(null)
    const [listResult, catalogResult] = await Promise.all([
      listQuery.refetch(),
      catalogQuery.refetch(),
    ])
    const refreshError = listResult.error ?? catalogResult.error
    if (refreshError) {
      toast(getApiErrorMessage(refreshError, 'Could not refresh permissions.'))
      return
    }
    toast('Permissions list refreshed.')
  }

  const listError = listQuery.isError
    ? getApiErrorMessage(listQuery.error, 'Could not load permissions.')
    : null

  const isRefreshing =
    (listQuery.isFetching && !listQuery.isLoading) ||
    (catalogQuery.isFetching && !catalogQuery.isLoading)

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <ToastBanner message={message} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium text-text-secondary">
            Super Admin &gt; Permissions Management
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Permissions Management
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            View and manage all system permissions across modules and roles.
          </p>
        </div>
        <Button
          type="button"
          className="w-full shrink-0 gap-2 sm:w-auto"
          disabled={isRefreshing || listQuery.isLoading}
          onClick={() => void handleRefresh()}
        >
          <RefreshCw
            className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
          />
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <PermissionSummaryCards
        totalPermissions={summary.total}
        usedInRoles={summary.usedInRoles}
        unusedPermissions={summary.unused}
      />

      <div className="space-y-4">
        <PermissionsFilterBar
          search={draftSearch}
          onSearchChange={setDraftSearch}
          moduleFilter={draftModule}
          onModuleFilterChange={setDraftModule}
          modules={modules}
          onApply={applyFilters}
        />

        {listError ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-soft bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-rose-700">{listError}</p>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => void listQuery.refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : listQuery.isLoading ? (
          <div className="rounded-2xl border border-border-soft bg-white px-6 py-12 text-center text-sm text-text-secondary shadow-sm">
            Loading permissions…
          </div>
        ) : (
          <>
            <PermissionsTable
              permissions={permissions}
              page={safePage}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
              onView={setSelectedPermission}
            />
            {listQuery.isFetching ? (
              <p className="text-sm text-text-secondary">Updating…</p>
            ) : null}
          </>
        )}
      </div>

      <PermissionDetailsDrawer
        permission={selectedPermission}
        open={Boolean(selectedPermission)}
        onOpenChange={(open) => {
          if (!open) setSelectedPermission(null)
        }}
      />
    </div>
  )
}
