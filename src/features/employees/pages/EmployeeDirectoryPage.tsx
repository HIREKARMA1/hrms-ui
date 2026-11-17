import { Archive, Eye, Pencil, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { employeeDirectoryMock } from '../mocks/employeeDirectory.mock'
import type {
  EmployeeProfile,
  EmploymentStatus,
} from '../types/employeeProfile.types'

const statuses: Array<EmploymentStatus | 'All'> = [
  'All',
  'Active',
  'Inactive',
  'Probation',
  'Notice Period',
  'Resigned',
  'Terminated',
  'Archived',
]

export function EmployeeDirectoryPage() {
  const navigate = useNavigate()
  const rbac = useOptionalRbacSession()
  const prefix = rbac?.routePrefix ?? '/hr'
  const [employees, setEmployees] = useState(() =>
    structuredClone(employeeDirectoryMock),
  )
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [status, setStatus] = useState<string>('All')
  const [branch, setBranch] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState<EmployeeProfile | null>(null)

  const departments = useMemo(
    () => ['All', ...new Set(employees.map((e) => e.department))],
    [employees],
  )
  const branches = useMemo(
    () => ['All', ...new Set(employees.map((e) => e.branch))],
    [employees],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return employees.filter((e) => {
      if (department !== 'All' && e.department !== department) return false
      if (status !== 'All' && e.employmentStatus !== status) return false
      if (branch !== 'All' && e.branch !== branch) return false
      if (!q) return true
      const fullName = `${e.firstName} ${e.middleName} ${e.lastName}`.toLowerCase()
      return (
        fullName.includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.workEmail.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q)
      )
    })
  }, [employees, search, department, status, branch])

  const setStatusFor = (id: string, next: EmploymentStatus) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              employmentStatus: next,
              activityHistory: [
                {
                  id: `act-${Date.now()}`,
                  at: new Date().toISOString().slice(0, 10),
                  action: `Status changed to ${next}`,
                  by: 'HR (UI session)',
                },
                ...e.activityHistory,
              ],
            }
          : e,
      ),
    )
  }

  const confirmArchiveOrDelete = () => {
    if (!deleteTarget) return
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === deleteTarget.id
          ? { ...e, employmentStatus: 'Archived' }
          : e,
      ),
    )
    setDeleteTarget(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="warning">Mock directory</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Employee Directory
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Search, filter, and manage employee status. Changes stay in this session.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            className="pl-9"
            placeholder="Search name, ID, email, designation..."
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
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'All' ? 'All statuses' : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={branch} onValueChange={setBranch}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b} value={b}>
                {b === 'All' ? 'All branches' : b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <p className="font-medium text-navy">
                    {e.firstName} {e.lastName}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {e.employeeId} · {e.workEmail}
                  </p>
                </TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>{e.designation}</TableCell>
                <TableCell>{e.branch}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      e.employmentStatus === 'Active'
                        ? 'success'
                        : e.employmentStatus === 'Probation' ||
                            e.employmentStatus === 'Notice Period'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {e.employmentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        navigate(`${prefix}/employees/profile/${e.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Feature name="employee.registration.edit">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigate(`${prefix}/employees/profile/${e.id}`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Select
                        onValueChange={(v) =>
                          setStatusFor(e.id, v as EmploymentStatus)
                        }
                      >
                        <SelectTrigger className="h-8 w-[130px] text-xs">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses
                            .filter((s) => s !== 'All')
                            .map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(e)}
                        title="Archive employee"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(e)}
                        title="Delete / archive (permission-gated)"
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    </Feature>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Archive employee?</DialogTitle>
            <DialogDescription>
              Hard delete is not available without a backend API. This marks{' '}
              {deleteTarget
                ? `${deleteTarget.firstName} ${deleteTarget.lastName}`
                : 'the employee'}{' '}
              as Archived in the local mock list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmArchiveOrDelete}>
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
