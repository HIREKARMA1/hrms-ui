/**
 * Department filter options for the internal job board.
 * GET /departments requires `departments:manage` (OpenAPI 403). Employees do not
 * have that permission, so options are derived from embedded job.department
 * fields when the departments catalog cannot be loaded.
 */
import type { BackendJob, BackendJobDepartment } from '../api/jobsApi.types'

export type DepartmentFilterOption = {
  id: string
  name: string
}

export function departmentOptionsFromCatalog(
  items: Array<{ id: string; name: string }> | undefined,
): DepartmentFilterOption[] {
  if (!items?.length) return []
  return items
    .map((item) => ({ id: item.id, name: item.name.trim() || item.id }))
    .filter((item) => item.id)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function departmentOptionsFromJobs(
  jobs: Array<Pick<BackendJob, 'departmentId' | 'department'>> | undefined,
  selected?: { id: string; name?: string | null },
): DepartmentFilterOption[] {
  const map = new Map<string, string>()
  for (const job of jobs ?? []) {
    const id = job.departmentId?.trim() || job.department?.id?.trim()
    if (!id) continue
    const name = job.department?.name?.trim() || id
    if (!map.has(id)) map.set(id, name)
  }
  const selectedId = selected?.id?.trim()
  if (selectedId && selectedId !== '__all__' && !map.has(selectedId)) {
    map.set(selectedId, selected?.name?.trim() || selectedId)
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function resolveDepartmentFilterOptions(input: {
  canListDepartments: boolean
  catalogItems?: Array<{ id: string; name: string }>
  jobs?: Array<Pick<BackendJob, 'departmentId' | 'department'>>
  selectedDepartmentId?: string
  selectedDepartment?: BackendJobDepartment | null
}): DepartmentFilterOption[] {
  if (input.canListDepartments) {
    const fromCatalog = departmentOptionsFromCatalog(input.catalogItems)
    if (fromCatalog.length) return fromCatalog
  }
  return departmentOptionsFromJobs(input.jobs, {
    id: input.selectedDepartmentId ?? '',
    name: input.selectedDepartment?.name,
  })
}
