import { Copy, Eye, Plus, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

import { useListOrganisationOnboardingsQuery } from '../api/organisationOnboardingApi'
import type {
  CreateOnboardingAccountResult,
  OnboardingFormStatus,
} from '../api/organisationOnboardingApi.types'
import { CreateOnboardingAccountDialog } from '../components/CreateOnboardingAccountDialog'
import {
  buildOnboardingFormLink,
  copyTextToClipboard,
} from '../utils/onboardingFormLink'

const ALL = '__all__'
const PAGE_SIZE = 50

function statusBadgeClass(status: OnboardingFormStatus) {
  switch (status) {
    case 'FILLED':
      return 'border-amber-200 bg-amber-50 text-amber-800'
    case 'VERIFIED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const d = value.slice(0, 10)
  return d || value
}

export function OrganisationOnboardingPage() {
  const location = useLocation()
  const prefix = location.pathname.startsWith('/superadmin')
    ? '/superadmin'
    : '/hradmin'
  const [status, setStatus] = useState<string>(ALL)
  const [createOpen, setCreateOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const list = useListOrganisationOnboardingsQuery({
    take: PAGE_SIZE,
    skip: 0,
    ...(status !== ALL ? { status: status as OnboardingFormStatus } : {}),
  })

  const items = list.data?.items ?? []
  const total = list.data?.total ?? 0

  const emptyLabel = useMemo(() => {
    if (status === ALL) return 'No organisation onboardings yet.'
    return `No ${status.toLowerCase()} onboardings.`
  }, [status])

  async function copyLink(id: string) {
    const ok = await copyTextToClipboard(buildOnboardingFormLink(id))
    setNotice(ok ? 'Form link copied.' : 'Could not copy link.')
  }

  function handleCreated(result: CreateOnboardingAccountResult) {
    setNotice(
      `Created ${result.employeeCode}. Password: ${result.password}. Copy the form link from the dialog.`,
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Organisation Onboarding
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Create temporary candidate accounts, collect documents, and verify into Employee
            Documents.
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
          <Feature name="onboarding.create">
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create account
            </Button>
          </Feature>
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {notice}
        </p>
      ) : null}

      {list.isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(list.error, 'Could not load onboardings.')}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <label className="block w-full max-w-xs">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">Status</span>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="INCOMPLETE">Incomplete</SelectItem>
              <SelectItem value="FILLED">Filled</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <p className="text-sm text-slate-500">{total} total</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {!list.isLoading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : null}
            {items.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.employeeCode}</TableCell>
                <TableCell>
                  {[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{row.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeClass(row.status)}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(row.expiresAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      title="Copy form link"
                      onClick={() => void copyLink(row.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" asChild>
                      <Link to={`${prefix}/organisation-onboarding/${row.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateOnboardingAccountDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  )
}

export default OrganisationOnboardingPage
