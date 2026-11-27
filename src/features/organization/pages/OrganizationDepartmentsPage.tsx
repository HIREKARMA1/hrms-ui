import { Eye, Filter, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

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
import { Textarea } from '@/components/ui/textarea'
import { ToastBanner, useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  DEPARTMENTS_PAGE_SIZE,
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentQuery,
  useListDepartmentEmployeesQuery,
  useListDepartmentsQuery,
  useUpdateDepartmentMutation,
} from '../api/departmentsApi'
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
import {
  formatEmploymentStatus,
  toDepartmentRecord,
} from '../utils/toDepartmentRecord'

type DeptForm = {
  code: string
  name: string
  description: string
  status: DepartmentStatus
}

const emptyDept: DeptForm = {
  code: '',
  name: '',
  description: '',
  status: 'Active',
}

const SEARCH_DEBOUNCE_MS = 350
const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{1,31}$/

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
  const { message, toast } = useToast()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
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
  const [viewDeptId, setViewDeptId] = useState<string | null>(null)
  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [employeesPage, setEmployeesPage] = useState(1)
  const [employeesForDeptId, setEmployeesForDeptId] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const isActiveFilter =
    appliedFilters.status === 'Active'
      ? true
      : appliedFilters.status === 'Inactive'
        ? false
        : undefined

  const listArgs = {
    page,
    limit: DEPARTMENTS_PAGE_SIZE,
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(isActiveFilter !== undefined ? { isActive: isActiveFilter } : {}),
  }

  const departmentsQuery = useListDepartmentsQuery(listArgs)
  const [createDepartment, createState] = useCreateDepartmentMutation()
  const [updateDepartment, updateState] = useUpdateDepartmentMutation()
  const [deleteDepartment, deleteState] = useDeleteDepartmentMutation()

  const detailQuery = useGetDepartmentQuery(viewDeptId ?? '', {
    skip: !viewDeptId,
  })

  const departments = useMemo(
    () => (departmentsQuery.data?.items ?? []).map(toDepartmentRecord),
    [departmentsQuery.data?.items],
  )

  /** Client-only head / employee-count filters on the current API page. */
  const filteredDepartments = useMemo(
    () =>
      filterDepartments(departments, '', {
        ...appliedFilters,
        // Status already applied server-side via `isActive`.
        status: 'All',
      }),
    [departments, appliedFilters],
  )

  const pagination = departmentsQuery.data?.pagination
  const totalPages = Math.max(pagination?.totalPages ?? 0, 0)
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : page

  const resolvedSelectedDeptId = filteredDepartments.some(
    (dept) => dept.id === selectedDeptId,
  )
    ? selectedDeptId
    : (filteredDepartments[0]?.id ?? '')

  const activeEmployeesDeptId = resolvedSelectedDeptId
  const activeEmployeesPage =
    employeesForDeptId === activeEmployeesDeptId ? employeesPage : 1

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  useEffect(() => {
    if (resolvedSelectedDeptId !== selectedDeptId) {
      setSelectedDeptId(resolvedSelectedDeptId)
    }
  }, [resolvedSelectedDeptId, selectedDeptId])

  useEffect(() => {
    if (
      employeesForDeptId !== activeEmployeesDeptId ||
      employeesPage !== activeEmployeesPage
    ) {
      setEmployeesForDeptId(activeEmployeesDeptId)
      setEmployeesPage(activeEmployeesPage)
    }
  }, [
    activeEmployeesDeptId,
    activeEmployeesPage,
    employeesForDeptId,
    employeesPage,
  ])

  const selectDepartment = (deptId: string) => {
    setSelectedDeptId(deptId)
    setEmployeesForDeptId(deptId)
    setEmployeesPage(1)
  }

  const employeesQuery = useListDepartmentEmployeesQuery(
    {
      id: activeEmployeesDeptId,
      page: activeEmployeesPage,
      limit: DEPARTMENTS_PAGE_SIZE,
      sortBy: 'firstName',
      sortOrder: 'asc',
    },
    { skip: !activeEmployeesDeptId },
  )

  const deptEmployees = employeesQuery.data?.items ?? []
  const employeesPagination = employeesQuery.data?.pagination
  const employeesTotalPages = Math.max(employeesPagination?.totalPages ?? 0, 0)

  const headOptions = useMemo(() => {
    const names = Array.from(
      new Set(departments.map((d) => d.headName).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return names
  }, [departments])

  const activeFilterCount = countActiveDepartmentFilters(appliedFilters)
  const formBusy = createState.isLoading || updateState.isLoading
  const codeValid = CODE_PATTERN.test(deptForm.code.trim())
  const canSave =
    deptForm.name.trim().length > 0 &&
    codeValid &&
    !formBusy

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
      code: dept.code,
      name: dept.name,
      description: dept.description,
      status: dept.status,
    })
    setDeptFormOpen(true)
  }

  const openViewDept = (deptId: string) => {
    selectDepartment(deptId)
    setViewDeptId(deptId)
  }

  const saveDept = async () => {
    if (!canSave) return
    const body = {
      code: deptForm.code.trim().toUpperCase(),
      name: deptForm.name.trim(),
      description: deptForm.description.trim() || undefined,
      isActive: deptForm.status === 'Active',
    }

    try {
      if (editingDeptId) {
        await updateDepartment({
          id: editingDeptId,
          body: {
            code: body.code,
            name: body.name,
            description: deptForm.description.trim() ? body.description : null,
            isActive: body.isActive,
          },
        }).unwrap()
        toast('Department updated successfully.')
      } else {
        const created = await createDepartment(body).unwrap()
        selectDepartment(created.id)
        toast('Department created successfully.')
      }
      setDeptFormOpen(false)
    } catch (error) {
      toast(
        getApiErrorMessage(
          error,
          editingDeptId
            ? 'Could not update the department.'
            : 'Could not create the department.',
        ),
      )
    }
  }

  const confirmDeleteDept = async () => {
    if (!deleteDept) return
    try {
      await deleteDepartment(deleteDept.id).unwrap()
      if (resolvedSelectedDeptId === deleteDept.id) {
        selectDepartment('')
      }
      if (viewDeptId === deleteDept.id) {
        setViewDeptId(null)
      }
      toast('Department deleted successfully.')
      setDeleteDept(null)
    } catch (error) {
      toast(getApiErrorMessage(error, 'Could not delete the department.'))
    }
  }

  const applyFilters = () => {
    setAppliedFilters(draftFilters)
    setPage(1)
    setFilterOpen(false)
  }

  const clearFilters = () => {
    setDraftFilters(EMPTY_DEPARTMENT_FILTERS)
    setAppliedFilters(EMPTY_DEPARTMENT_FILTERS)
    setPage(1)
    setFilterOpen(false)
  }

  const listError = departmentsQuery.isError
    ? getApiErrorMessage(departmentsQuery.error, 'Could not load departments.')
    : null

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 pb-8">
      <ToastBanner message={message} />

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
            placeholder="Search by department name or code"
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
        {departmentsQuery.isLoading && !departmentsQuery.data ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : listError ? (
          <div className="space-y-3 p-6 text-center">
            <p role="alert" className="text-sm text-rose-600">
              {listError}
            </p>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-[#E2E6EF]"
              onClick={() => void departmentsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
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
                <TableHead className="h-11 text-center text-xs font-semibold tracking-wide text-[#667085] uppercase">
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
                    {departments.length === 0
                      ? 'No departments found.'
                      : 'No departments match your search or filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((dept) => (
                  <TableRow
                    key={dept.id}
                    className={cn(
                      'border-[#E2E6EF] transition-colors hover:bg-[#F7F8FC]',
                      resolvedSelectedDeptId === dept.id && 'bg-[#F0FDFA]',
                    )}
                  >
                    <TableCell className="align-middle">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => selectDepartment(dept.id)}
                      >
                        <span className="block text-sm font-semibold text-[#17213A] hover:text-[#0F766E]">
                          {dept.name}
                        </span>
                        <span className="block text-xs text-[#98A2B3]">
                          {dept.code}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="align-middle text-sm text-[#344054]">
                      {dept.headName || '—'}
                    </TableCell>
                    <TableCell className="align-middle">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#CCFBF1] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#0F766E]">
                        {dept.employeeCount}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate align-middle text-sm text-[#667085]">
                      {dept.description || '—'}
                    </TableCell>
                    <TableCell className="align-middle">
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
                    <TableCell className="text-center align-middle">
                      <div className="inline-flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#667085] hover:bg-[#CCFBF1]/60 hover:text-[#0F766E]"
                          onClick={() => openViewDept(dept.id)}
                          aria-label={`View ${dept.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Feature name="employee.organization.edit">
                          <span className="inline-flex items-center gap-1">
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
                          </span>
                        </Feature>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination && totalPages > 0 ? (
        <TablePagination
          page={safePage}
          totalPages={totalPages}
          total={pagination.total}
          itemLabel="departments"
          onPageChange={setPage}
        />
      ) : null}

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
            value={resolvedSelectedDeptId || undefined}
            onValueChange={selectDepartment}
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
          {!resolvedSelectedDeptId ? (
            <p className="rounded-lg border border-dashed border-[#E2E6EF] px-4 py-8 text-center text-sm text-[#667085]">
              Select a department to view linked employees.
            </p>
          ) : employeesQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : employeesQuery.isError ? (
            <div className="space-y-3 text-center">
              <p role="alert" className="text-sm text-rose-600">
                {getApiErrorMessage(
                  employeesQuery.error,
                  'Could not load department employees.',
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-[#E2E6EF]"
                onClick={() => void employeesQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : deptEmployees.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#E2E6EF] px-4 py-8 text-center text-sm text-[#667085]">
              No employees found for this department.
            </p>
          ) : (
            <div className="space-y-3">
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
                          {employee.designation || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              employee.employmentStatus === 'ACTIVE'
                                ? 'success'
                                : 'secondary'
                            }
                            className={
                              employee.employmentStatus === 'ACTIVE'
                                ? 'border-transparent bg-[#CCFBF1] text-[#0F766E]'
                                : undefined
                            }
                          >
                            {formatEmploymentStatus(employee.employmentStatus)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {employeesPagination && employeesTotalPages > 0 ? (
                <TablePagination
                  page={activeEmployeesPage}
                  totalPages={employeesTotalPages}
                  total={employeesPagination.total}
                  itemLabel="employees"
                  onPageChange={setEmployeesPage}
                />
              ) : null}
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
              Set the department code, name, description, and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="dept-code">Department Code</Label>
              <Input
                id="dept-code"
                value={deptForm.code}
                onChange={(e) =>
                  setDeptForm((f) => ({
                    ...f,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g. ENG"
                maxLength={32}
                className="rounded-lg border-[#E2E6EF] uppercase"
              />
              {deptForm.code.trim() && !codeValid ? (
                <p className="text-xs text-rose-600">
                  Code must be 2–32 characters: A–Z, 0–9, underscore or hyphen.
                </p>
              ) : null}
            </div>
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
              disabled={formBusy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-[#0F766E] text-white hover:bg-[#0D9488]"
              onClick={() => void saveDept()}
              disabled={!canSave}
            >
              {formBusy ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewDeptId)}
        onOpenChange={(open) => {
          if (!open) setViewDeptId(null)
        }}
      >
        <DialogContent className="rounded-xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#17213A]">
              Department details
            </DialogTitle>
            <DialogDescription>
              Live department record from the HRMS API.
            </DialogDescription>
          </DialogHeader>
          {detailQuery.isLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : detailQuery.isError ? (
            <div className="space-y-3">
              <p role="alert" className="text-sm text-rose-600">
                {getApiErrorMessage(
                  detailQuery.error,
                  'Could not load department details.',
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-[#E2E6EF]"
                onClick={() => void detailQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : detailQuery.data ? (
            <div className="grid gap-3 text-sm">
              <div>
                <p className="text-xs text-[#667085]">Name</p>
                <p className="font-semibold text-[#17213A]">
                  {detailQuery.data.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#667085]">Code</p>
                <p className="text-[#344054]">{detailQuery.data.code}</p>
              </div>
              <div>
                <p className="text-xs text-[#667085]">Status</p>
                <Badge
                  variant={detailQuery.data.isActive ? 'success' : 'secondary'}
                  className={
                    detailQuery.data.isActive
                      ? 'border-transparent bg-[#CCFBF1] text-[#0F766E]'
                      : 'border-transparent bg-[#F2F4F7] text-[#667085]'
                  }
                >
                  {detailQuery.data.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[#667085]">Employees</p>
                <p className="text-[#344054]">
                  {detailQuery.data.employeeCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#667085]">Description</p>
                <p className="text-[#344054]">
                  {detailQuery.data.description || '—'}
                </p>
              </div>
              {detailQuery.data.employees.length > 0 ? (
                <div>
                  <p className="mb-1.5 text-xs text-[#667085]">
                    Assigned employees (preview)
                  </p>
                  <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[#E2E6EF] p-2">
                    {detailQuery.data.employees.map((employee) => (
                      <li
                        key={employee.id}
                        className="text-sm text-[#344054]"
                      >
                        {employee.name}{' '}
                        <span className="text-[#98A2B3]">
                          ({employee.employeeCode})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-[#E2E6EF]"
              onClick={() => setViewDeptId(null)}
            >
              Close
            </Button>
            {detailQuery.data ? (
              <Feature name="employee.organization.edit">
                <Button
                  type="button"
                  className="rounded-lg bg-[#0F766E] text-white hover:bg-[#0D9488]"
                  onClick={() => {
                    const detail = detailQuery.data
                    if (!detail) return
                    openEditDept(toDepartmentRecord(detail))
                    setViewDeptId(null)
                  }}
                >
                  Edit
                </Button>
              </Feature>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteDept)}
        onOpenChange={(open) => {
          if (!open && !deleteState.isLoading) setDeleteDept(null)
        }}
      >
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#17213A]">
              Delete department?
            </DialogTitle>
            <DialogDescription>
              Permanently deletes “{deleteDept?.name}”. Departments with
              assigned employees or other references cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-[#E2E6EF]"
              onClick={() => setDeleteDept(null)}
              disabled={deleteState.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => void confirmDeleteDept()}
              disabled={deleteState.isLoading}
            >
              {deleteState.isLoading ? 'Deleting…' : 'Delete'}
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
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 pb-8">
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
