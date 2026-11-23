import { Archive, Eye, Pencil, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'
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

import {
  getPageInfo,
  SERVER_EMPLOYMENT_STATUSES,
  toBackendStatus,
  type EmployeeRecord,
} from '../api/employeeMappers'
import {
  EMPLOYEE_PAGE_SIZE,
  useDeleteEmployeeMutation,
  useListEmployeesQuery,
  useSearchEmployeesQuery,
  useUpdateEmployeeMutation,
} from '../api/employeesApi'
import { EmployeeNotice } from '../components/EmployeeNotice'
import type { EmploymentStatus } from '../types/employeeProfile.types'
import { getQueryViewState } from '../utils/queryViewState'

const SEARCH_DEBOUNCE_MS = 350

const statusFilters: Array<EmploymentStatus | 'All'> = ['All', ...SERVER_EMPLOYMENT_STATUSES]

type Notice = { tone: 'success' | 'warning' | 'error'; text: string }

function statusVariant(status: EmploymentStatus) {
  if (status === 'Active') return 'success'
  if (status === 'Probation' || status === 'On Leave') return 'warning'
  return 'secondary'
}

export function EmployeeDirectoryPage() {
  const navigate = useNavigate()
  const rbac = useOptionalRbacSession()
  const prefix = rbac?.routePrefix ?? '/manager'
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [skip, setSkip] = useState(0)
  const [department, setDepartment] = useState('All')
  const [status, setStatus] = useState<string>('All')
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRecord | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim())
      setSkip(0)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const listResult = useListEmployeesQuery(
    { skip, take: EMPLOYEE_PAGE_SIZE },
    { skip: Boolean(query) },
  )
  const searchResult = useSearchEmployeesQuery(
    { q: query, skip, take: EMPLOYEE_PAGE_SIZE },
    { skip: !query },
  )
  const active = query ? searchResult : listResult
  const page = active.data
  const records = useMemo(() => page?.items ?? [], [page])

  const [updateEmployee, updateState] = useUpdateEmployeeMutation()
  const [deleteEmployee, deleteState] = useDeleteEmployeeMutation()

  const departments = useMemo(
    () => ['All', ...new Set(records.map((r) => r.profile.department).filter(Boolean))],
    [records],
  )

  const filtered = useMemo(
    () =>
      records.filter(({ profile }) => {
        if (department !== 'All' && profile.department !== department) return false
        if (status !== 'All' && profile.employmentStatus !== status) return false
        return true
      }),
    [records, department, status],
  )

  const viewState = getQueryViewState({
    isLoading: active.isLoading || (active.isFetching && !page),
    isError: active.isError,
    hasData: Boolean(page),
    itemCount: filtered.length,
  })
  const pageInfo = page ? getPageInfo(page, records.length) : null

  const setStatusFor = async (record: EmployeeRecord, next: EmploymentStatus) => {
    const employmentStatus = toBackendStatus(next)
    if (!employmentStatus || next === record.profile.employmentStatus) return
    setNotice(null)
    try {
      await updateEmployee({ id: record.server.id, body: { employmentStatus } }).unwrap()
      setNotice({
        tone: 'success',
        text: `${record.profile.firstName} ${record.profile.lastName} is now ${next}.`,
      })
    } catch (error) {
      setNotice({ tone: 'error', text: getApiErrorMessage(error, 'Could not update the status.') })
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setNotice(null)
    try {
      const result = await deleteEmployee(deleteTarget.server.id).unwrap()
      const device =
        result.deviceSync.status === 'failed'
          ? ` Biometric device: ${result.deviceSync.message}`
          : ''
      setNotice({
        tone: result.deviceSync.status === 'failed' ? 'warning' : 'success',
        text: `${result.name || 'Employee'} was deleted.${device}`,
      })
      setDeleteTarget(null)
    } catch (error) {
      setNotice({ tone: 'error', text: getApiErrorMessage(error, 'Could not delete the employee.') })
      setDeleteTarget(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Employee Directory
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Search, filter, and manage employee status.
        </p>
      </div>

      {notice ? <EmployeeNotice tone={notice.tone}>{notice.text}</EmployeeNotice> : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            className="pl-9"
            placeholder="Search name, code, email, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>
                {d === 'All' ? 'All departments' : d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'All' ? 'All statuses' : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {department !== 'All' || status !== 'All' ? (
        <p className="-mt-4 text-xs text-text-secondary">
          Department and status filters apply to the current page.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        {viewState === 'error' ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <p className="text-sm text-rose-700">
              {getApiErrorMessage(active.error, 'Could not load employees.')}
            </p>
            <Button type="button" variant="outline" className="gap-2" onClick={() => void active.refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewState === 'loading'
                ? Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {Array.from({ length: 6 }, (__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}
              {viewState === 'empty' ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-text-secondary">
                    {query || department !== 'All' || status !== 'All'
                      ? 'No employees match your search or filters.'
                      : 'No employees have been added yet.'}
                  </TableCell>
                </TableRow>
              ) : null}
              {viewState === 'ready'
                ? filtered.map((record) => {
                    const e = record.profile
                    return (
                      <TableRow key={record.server.id}>
                        <TableCell>
                          <p className="font-medium text-navy">
                            {e.firstName} {e.lastName}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {e.employeeCode} · {e.workEmail}
                          </p>
                        </TableCell>
                        <TableCell>{e.department || '—'}</TableCell>
                        <TableCell>{e.designation}</TableCell>
                        <TableCell>{e.dateOfJoining || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(e.employmentStatus)}>
                            {e.employmentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              title="View profile"
                              onClick={() => navigate(`${prefix}/employees/profile/${record.server.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* Edit / status are PATCH /employees/:id (employees:update). */}
                            <Feature name="employee.manage">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                title="Edit profile"
                                onClick={() => navigate(`${prefix}/employees/profile/${record.server.id}`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Select
                                value=""
                                disabled={updateState.isLoading}
                                onValueChange={(v) => void setStatusFor(record, v as EmploymentStatus)}
                              >
                                <SelectTrigger className="h-8 w-[130px] text-xs">
                                  <SelectValue placeholder="Set status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SERVER_EMPLOYMENT_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s} disabled={s === e.employmentStatus}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled
                                title="Archive is not supported by the server yet"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </Feature>
                            {/* Delete is DELETE /employees/:id (employees:delete). */}
                            <Feature name="employee.delete">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteTarget(record)}
                                title="Delete employee"
                              >
                                <Trash2 className="h-4 w-4 text-rose-600" />
                              </Button>
                            </Feature>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                : null}
            </TableBody>
          </Table>
        )}
        {pageInfo && viewState !== 'error' ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-soft px-4 py-3 text-sm text-text-secondary">
            <span>
              {pageInfo.total === 0
                ? 'No employees'
                : `Showing ${pageInfo.from}–${pageInfo.to} of ${pageInfo.total}`}
              {active.isFetching ? ' · Updating…' : ''}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!pageInfo.hasPrevious || active.isFetching}
                onClick={() => setSkip((s) => Math.max(s - EMPLOYEE_PAGE_SIZE, 0))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!pageInfo.hasNext || active.isFetching}
                onClick={() => setSkip((s) => s + EMPLOYEE_PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && !deleteState.isLoading && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete employee permanently?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `${deleteTarget.profile.firstName} ${deleteTarget.profile.lastName} (${deleteTarget.profile.employeeCode})`
                : 'This employee'}{' '}
              will be removed from the HRMS database
              {deleteTarget?.server.deviceId ? ' and from the linked biometric device' : ''}.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteState.isLoading}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-700"
              disabled={deleteState.isLoading}
              onClick={() => void confirmDelete()}
            >
              {deleteState.isLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
