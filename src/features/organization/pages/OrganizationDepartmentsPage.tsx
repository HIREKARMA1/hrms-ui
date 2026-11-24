import { Filter, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { employeeDirectoryMock } from '@/features/employees/mocks/employeeDirectory.mock'
import { Feature } from '@/features/rbac/components/Feature'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import {
  departmentsMock,
  designationsMock,
} from '../mocks/organizationMocks'
import type {
  DepartmentRecord,
  DepartmentStatus,
  DesignationRecord,
} from '../types/organization.types'
import {
  EMPTY_DEPARTMENT_FILTERS,
  countActiveDepartmentFilters,
  filterDepartments,
  type DepartmentFilters,
} from '../utils/departmentFilters'

type DeptForm = {
  name: string
  description: string
  headName: string
  status: DepartmentStatus
}

const emptyDept: DeptForm = {
  name: '',
  description: '',
  headName: '',
  status: 'Active',
}

/**
 * Organization routes:
 * - `/…/departments` → Department Management (redesigned, no tab bar)
 * - `/…/designations` → Designations (sidebar entry; no shared tab bar)
 */
export function OrganizationDepartmentsPage() {
  const { pathname } = useLocation()
  const isDesignationsRoute = /\/designations\/?$/.test(pathname)

  if (isDesignationsRoute) {
    return <DesignationsSection />
  }

  return <DepartmentsSection />
}

function DepartmentsSection() {
  const [departments, setDepartments] = useState(() =>
    structuredClone(departmentsMock),
  )
  const [search, setSearch] = useState('')
  const [draftFilters, setDraftFilters] = useState<DepartmentFilters>(
    EMPTY_DEPARTMENT_FILTERS,
  )
  const [appliedFilters, setAppliedFilters] =
    useState<DepartmentFilters>(EMPTY_DEPARTMENT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const [deptFormOpen, setDeptFormOpen] = useState(false)
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null)
  const [deptForm, setDeptForm] = useState<DeptForm>(emptyDept)
  const [deleteDept, setDeleteDept] = useState<DepartmentRecord | null>(null)
  const [selectedDeptId, setSelectedDeptId] = useState(
    departmentsMock[0]?.id ?? '',
  )

  const headOptions = useMemo(() => {
    const names = Array.from(
      new Set(departments.map((d) => d.headName).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return names
  }, [departments])

  const filteredDepartments = useMemo(
    () => filterDepartments(departments, search, appliedFilters),
    [departments, search, appliedFilters],
  )

  const activeFilterCount = countActiveDepartmentFilters(appliedFilters)

  const deptEmployees = useMemo(() => {
    const dept = departments.find((d) => d.id === selectedDeptId)
    if (!dept) return []
    return employeeDirectoryMock.filter((e) => e.department === dept.name)
  }, [departments, selectedDeptId])

  useEffect(() => {
    if (!filterOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFilterOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [filterOpen])

  const openCreateDept = () => {
    setEditingDeptId(null)
    setDeptForm(emptyDept)
    setDeptFormOpen(true)
  }

  const openEditDept = (dept: DepartmentRecord) => {
    setEditingDeptId(dept.id)
    setDeptForm({
      name: dept.name,
      description: dept.description,
      headName: dept.headName,
      status: dept.status,
    })
    setDeptFormOpen(true)
  }

  const saveDept = () => {
    if (!deptForm.name.trim()) return
    if (editingDeptId) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDeptId
            ? {
                ...d,
                name: deptForm.name.trim(),
                description: deptForm.description.trim(),
                headName: deptForm.headName.trim(),
                status: deptForm.status,
              }
            : d,
        ),
      )
    } else {
      const created: DepartmentRecord = {
        id: `d-${Date.now()}`,
        name: deptForm.name.trim(),
        description: deptForm.description.trim(),
        headName: deptForm.headName.trim(),
        employeeCount: 0,
        status: deptForm.status,
      }
      setDepartments((prev) => [created, ...prev])
      setSelectedDeptId(created.id)
    }
    setDeptFormOpen(false)
  }

  const confirmDeleteDept = () => {
    if (!deleteDept) return
    const removedId = deleteDept.id
    const remaining = departments.filter((d) => d.id !== removedId)
    setDepartments(remaining)
    if (selectedDeptId === removedId) {
      setSelectedDeptId(remaining[0]?.id ?? '')
    }
    setDeleteDept(null)
  }

  const applyFilters = () => {
    setAppliedFilters(draftFilters)
    setFilterOpen(false)
  }

  const clearFilters = () => {
    setDraftFilters(EMPTY_DEPARTMENT_FILTERS)
    setAppliedFilters(EMPTY_DEPARTMENT_FILTERS)
    setFilterOpen(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[#17213A]">
          Department Management
        </h1>
        <p className="text-sm text-[#667085]">
          Manage departments, department heads, and employee allocations.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by department name or department head"
            className="h-10 rounded-lg border-[#E2E6EF] bg-white pl-9 text-sm shadow-none focus-visible:ring-[#0F766E]/30"
          />
        </div>

        <div className="relative flex shrink-0 items-center gap-2" ref={filterRef}>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-10 gap-2 rounded-lg border-[#E2E6EF] bg-white text-[#17213A] hover:bg-[#F7F8FC]',
              activeFilterCount > 0 && 'border-[#14B8A6] text-[#0F766E]',
            )}
            onClick={() => {
              setDraftFilters(appliedFilters)
              setFilterOpen((open) => !open)
            }}
          >
            <Filter className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#CCFBF1] px-1.5 text-xs font-semibold text-[#0F766E]">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>

          {filterOpen ? (
            <div className="absolute top-[calc(100%+0.5rem)] right-0 z-30 w-[min(100vw-2rem,20rem)] rounded-xl border border-[#E2E6EF] bg-white p-4 shadow-lg sm:left-0 sm:right-auto">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#17213A]">Filters</p>
                <button
                  type="button"
                  className="rounded-md p-1 text-[#98A2B3] hover:bg-[#F7F8FC] hover:text-[#17213A]"
                  onClick={() => setFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#667085]">Department Head</Label>
                  <Select
                    value={draftFilters.headName}
                    onValueChange={(value) =>
                      setDraftFilters((f) => ({ ...f, headName: value }))
                    }
                  >
                    <SelectTrigger className="h-9 rounded-lg border-[#E2E6EF]">
                      <SelectValue placeholder="All heads" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      {headOptions.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#667085]">
                    Department Status
                  </Label>
                  <Select
                    value={draftFilters.status}
                    onValueChange={(value) =>
                      setDraftFilters((f) => ({
                        ...f,
                        status: value as DepartmentFilters['status'],
                      }))
                    }
                  >
                    <SelectTrigger className="h-9 rounded-lg border-[#E2E6EF]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#667085]">
                    Employee Count range
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="Min"
                      value={draftFilters.minEmployees}
                      onChange={(e) =>
                        setDraftFilters((f) => ({
                          ...f,
                          minEmployees: e.target.value,
                        }))
                      }
                      className="h-9 rounded-lg border-[#E2E6EF]"
                    />
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="Max"
                      value={draftFilters.maxEmployees}
                      onChange={(e) =>
                        setDraftFilters((f) => ({
                          ...f,
                          maxEmployees: e.target.value,
                        }))
                      }
                      className="h-9 rounded-lg border-[#E2E6EF]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 flex-1 rounded-lg border-[#E2E6EF]"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button
                  type="button"
                  className="h-9 flex-1 rounded-lg bg-[#0F766E] text-white hover:bg-[#0D9488]"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          ) : null}

          <Feature name="employee.organization.edit">
            <Button
              type="button"
              className="h-10 gap-2 rounded-lg bg-[#0F766E] text-white hover:bg-[#0D9488]"
              onClick={openCreateDept}
            >
              <Plus className="h-4 w-4" />
              Create Department
            </Button>
          </Feature>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E2E6EF] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E6EF] hover:bg-transparent">
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-[#667085] uppercase">
                Department
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-[#667085] uppercase">
                Department Head
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-[#667085] uppercase">
                Employees
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-[#667085] uppercase">
                Description
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold tracking-wide text-[#667085] uppercase">
                Status
              </TableHead>
              <TableHead className="h-11 text-right text-xs font-semibold tracking-wide text-[#667085] uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm text-[#667085]"
                >
                  No departments match your search or filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => (
                <TableRow
                  key={dept.id}
                  className="border-[#E2E6EF] transition-colors hover:bg-[#F7F8FC]"
                >
                  <TableCell>
                    <button
                      type="button"
                      className="text-left text-sm font-semibold text-[#17213A] hover:text-[#0F766E]"
                      onClick={() => setSelectedDeptId(dept.id)}
                    >
                      {dept.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-[#344054]">
                    {dept.headName || '—'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#CCFBF1] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#0F766E]">
                      {dept.employeeCount}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate text-sm text-[#667085]">
                    {dept.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={dept.status === 'Active' ? 'success' : 'secondary'}
                      className={cn(
                        'font-medium',
                        dept.status === 'Active'
                          ? 'border-transparent bg-[#CCFBF1] text-[#0F766E]'
                          : 'border-transparent bg-[#F2F4F7] text-[#667085]',
                      )}
                    >
                      {dept.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Feature name="employee.organization.edit">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#667085] hover:bg-[#CCFBF1]/60 hover:text-[#0F766E]"
                          onClick={() => openEditDept(dept)}
                          aria-label={`Edit ${dept.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#667085] hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => setDeleteDept(dept)}
                          aria-label={`Delete ${dept.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Feature>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Card className="rounded-xl border-[#E2E6EF] bg-white shadow-none">
        <CardHeader className="gap-3 space-y-0 border-b border-[#E2E6EF] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[#17213A]">
              Employees by Department
            </CardTitle>
            <CardDescription className="text-sm text-[#667085]">
              Select a department to view linked employees.
            </CardDescription>
          </div>
          <Select
            value={selectedDeptId || undefined}
            onValueChange={setSelectedDeptId}
            disabled={departments.length === 0}
          >
            <SelectTrigger className="h-10 w-full rounded-lg border-[#E2E6EF] sm:w-64">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-4">
          {deptEmployees.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#E2E6EF] px-4 py-8 text-center text-sm text-[#667085]">
              No employees found for this department.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#E2E6EF]">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E2E6EF] hover:bg-transparent">
                    <TableHead className="h-10 text-xs font-semibold text-[#667085] uppercase">
                      Employee name
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-[#667085] uppercase">
                      Designation
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold text-[#667085] uppercase">
                      Employment status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptEmployees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="border-[#E2E6EF] hover:bg-[#F7F8FC]"
                    >
                      <TableCell className="text-sm font-medium text-[#17213A]">
                        {employee.firstName} {employee.lastName}
                      </TableCell>
                      <TableCell className="text-sm text-[#344054]">
                        {employee.designation}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.employmentStatus === 'Active'
                              ? 'success'
                              : 'secondary'
                          }
                          className={
                            employee.employmentStatus === 'Active'
                              ? 'border-transparent bg-[#CCFBF1] text-[#0F766E]'
                              : undefined
                          }
                        >
                          {employee.employmentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deptFormOpen} onOpenChange={setDeptFormOpen}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#17213A]">
              {editingDeptId ? 'Edit Department' : 'Create Department'}
            </DialogTitle>
            <DialogDescription>
              Assign a department head, description, and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                value={deptForm.name}
                onChange={(e) =>
                  setDeptForm((f) => ({ ...f, name: e.target.value }))
                }
                className="rounded-lg border-[#E2E6EF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-head">Department Head</Label>
              <Input
                id="dept-head"
                value={deptForm.headName}
                onChange={(e) =>
                  setDeptForm((f) => ({ ...f, headName: e.target.value }))
                }
                className="rounded-lg border-[#E2E6EF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-description">Description</Label>
              <Textarea
                id="dept-description"
                rows={3}
                value={deptForm.description}
                onChange={(e) =>
                  setDeptForm((f) => ({ ...f, description: e.target.value }))
                }
                className="rounded-lg border-[#E2E6EF]"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={deptForm.status}
                onValueChange={(value) =>
                  setDeptForm((f) => ({
                    ...f,
                    status: value as DepartmentStatus,
                  }))
                }
              >
                <SelectTrigger className="rounded-lg border-[#E2E6EF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-[#E2E6EF]"
              onClick={() => setDeptFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-[#0F766E] text-white hover:bg-[#0D9488]"
              onClick={saveDept}
              disabled={!deptForm.name.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteDept)}
        onOpenChange={(open) => !open && setDeleteDept(null)}
      >
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#17213A]">
              Delete department?
            </DialogTitle>
            <DialogDescription>
              Removes “{deleteDept?.name}” from the local list. Requires
              organization edit permission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-[#E2E6EF]"
              onClick={() => setDeleteDept(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              onClick={confirmDeleteDept}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Designations sidebar route — kept without the shared horizontal tab bar. */
function DesignationsSection() {
  const [designations, setDesignations] = useState(() =>
    structuredClone(designationsMock),
  )
  const [departments] = useState(() => structuredClone(departmentsMock))
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    departmentName: departmentsMock[0]?.name ?? 'Engineering',
    level: 'L3',
  })

  const saveDesignation = () => {
    if (!form.title.trim()) return
    const record: DesignationRecord = {
      id: `des-${Date.now()}`,
      title: form.title.trim(),
      departmentName: form.departmentName,
      level: form.level,
    }
    setDesignations((prev) => [record, ...prev])
    setFormOpen(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[#17213A]">
            Designations
          </h1>
          <p className="text-sm text-[#667085]">
            Manage designation titles and levels by department.
          </p>
        </div>
        <Feature name="employee.organization.edit">
          <Button
            type="button"
            className="h-10 gap-2 rounded-lg bg-[#0F766E] text-white hover:bg-[#0D9488]"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Designation
          </Button>
        </Feature>
      </header>

      <div className="overflow-hidden rounded-xl border border-[#E2E6EF] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E6EF] hover:bg-transparent">
              <TableHead className="h-11 text-xs font-semibold text-[#667085] uppercase">
                Title
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold text-[#667085] uppercase">
                Department
              </TableHead>
              <TableHead className="h-11 text-xs font-semibold text-[#667085] uppercase">
                Level
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designations.map((item) => (
              <TableRow
                key={item.id}
                className="border-[#E2E6EF] hover:bg-[#F7F8FC]"
              >
                <TableCell className="font-semibold text-[#17213A]">
                  {item.title}
                </TableCell>
                <TableCell className="text-[#344054]">
                  {item.departmentName}
                </TableCell>
                <TableCell className="text-[#344054]">{item.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#17213A]">Add Designation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="rounded-lg border-[#E2E6EF]"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.departmentName}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, departmentName: value }))
                }
              >
                <SelectTrigger className="rounded-lg border-[#E2E6EF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Input
                value={form.level}
                onChange={(e) =>
                  setForm((f) => ({ ...f, level: e.target.value }))
                }
                className="rounded-lg border-[#E2E6EF]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-[#E2E6EF]"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-[#0F766E] text-white hover:bg-[#0D9488]"
              onClick={saveDesignation}
              disabled={!form.title.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
