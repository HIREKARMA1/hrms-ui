import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import {
  departmentsMock,
  designationsMock,
  hierarchyMock,
  jobRolesMock,
  teamsMock,
  transferHistoryMock,
} from '../mocks/organizationMocks'
import type {
  DepartmentRecord,
  DesignationRecord,
  JobRoleRecord,
  TeamRecord,
} from '../types/organization.types'
import { employeeDirectoryMock } from '@/features/employees/mocks/employeeDirectory.mock'

type DeptForm = {
  name: string
  description: string
  headName: string
}

const emptyDept: DeptForm = { name: '', description: '', headName: '' }

/**
 * Additive Organization & Department Management for existing `/…/departments` routes.
 */
export function OrganizationDepartmentsPage() {
  const [departments, setDepartments] = useState(() =>
    structuredClone(departmentsMock),
  )
  const [teams, setTeams] = useState(() => structuredClone(teamsMock))
  const [designations, setDesignations] = useState(() =>
    structuredClone(designationsMock),
  )
  const [jobRoles, setJobRoles] = useState(() => structuredClone(jobRolesMock))
  const [deptFormOpen, setDeptFormOpen] = useState(false)
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null)
  const [deptForm, setDeptForm] = useState<DeptForm>(emptyDept)
  const [deleteDept, setDeleteDept] = useState<DepartmentRecord | null>(null)
  const [teamFormOpen, setTeamFormOpen] = useState(false)
  const [teamForm, setTeamForm] = useState({
    name: '',
    departmentId: departmentsMock[0]?.id ?? '',
    leaderName: '',
    members: '',
  })
  const [designationFormOpen, setDesignationFormOpen] = useState(false)
  const [designationForm, setDesignationForm] = useState({
    title: '',
    departmentName: 'Engineering',
    level: 'L3',
  })
  const [roleFormOpen, setRoleFormOpen] = useState(false)
  const [roleForm, setRoleForm] = useState({
    title: '',
    designationId: designationsMock[0]?.id ?? '',
    description: '',
  })
  const [selectedDeptId, setSelectedDeptId] = useState(departmentsMock[0]?.id ?? '')

  const deptEmployees = useMemo(() => {
    const dept = departments.find((d) => d.id === selectedDeptId)
    if (!dept) return []
    return employeeDirectoryMock.filter((e) => e.department === dept.name)
  }, [departments, selectedDeptId])

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
              }
            : d,
        ),
      )
    } else {
      setDepartments((prev) => [
        {
          id: `d-${Date.now()}`,
          name: deptForm.name.trim(),
          description: deptForm.description.trim(),
          headName: deptForm.headName.trim(),
          employeeCount: 0,
        },
        ...prev,
      ])
    }
    setDeptFormOpen(false)
  }

  const confirmDeleteDept = () => {
    if (!deleteDept) return
    setDepartments((prev) => prev.filter((d) => d.id !== deleteDept.id))
    setDeleteDept(null)
  }

  const saveTeam = () => {
    if (!teamForm.name.trim()) return
    const dept = departments.find((d) => d.id === teamForm.departmentId)
    const record: TeamRecord = {
      id: `t-${Date.now()}`,
      name: teamForm.name.trim(),
      departmentId: teamForm.departmentId,
      departmentName: dept?.name ?? 'Unknown',
      leaderName: teamForm.leaderName.trim(),
      memberNames: teamForm.members
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    setTeams((prev) => [record, ...prev])
    setTeamFormOpen(false)
  }

  const saveDesignation = () => {
    if (!designationForm.title.trim()) return
    const record: DesignationRecord = {
      id: `des-${Date.now()}`,
      title: designationForm.title.trim(),
      departmentName: designationForm.departmentName,
      level: designationForm.level,
    }
    setDesignations((prev) => [record, ...prev])
    setDesignationFormOpen(false)
  }

  const saveRole = () => {
    if (!roleForm.title.trim()) return
    const record: JobRoleRecord = {
      id: `jr-${Date.now()}`,
      title: roleForm.title.trim(),
      designationId: roleForm.designationId,
      description: roleForm.description.trim(),
    }
    setJobRoles((prev) => [record, ...prev])
    setRoleFormOpen(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="warning">Mock / UI-only</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Organization & Departments
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Departments, teams, designations, hierarchy, and transfer history.
        </p>
      </div>

      <Tabs defaultValue="departments">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="designations">Designations</TabsTrigger>
          <TabsTrigger value="roles">Job Roles</TabsTrigger>
          <TabsTrigger value="hierarchy">Reporting Hierarchy</TabsTrigger>
          <TabsTrigger value="org-chart">Org Chart</TabsTrigger>
          <TabsTrigger value="transfers">Transfer History</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Feature name="employee.organization.edit">
              <Button type="button" className="gap-2" onClick={openCreateDept}>
                <Plus className="h-4 w-4" />
                Create Department
              </Button>
            </Feature>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium text-navy">
                      <button
                        type="button"
                        className="text-left hover:underline"
                        onClick={() => setSelectedDeptId(dept.id)}
                      >
                        {dept.name}
                      </button>
                    </TableCell>
                    <TableCell>{dept.headName}</TableCell>
                    <TableCell className="tabular-nums">
                      {dept.employeeCount}
                    </TableCell>
                    <TableCell className="max-w-xs text-text-secondary">
                      {dept.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Feature name="employee.organization.edit">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDept(dept)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteDept(dept)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </div>
                      </Feature>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Department-wise employee listing</CardTitle>
              <CardDescription>
                Employees linked to the selected department (mock directory)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ul className="space-y-2">
                {deptEmployees.length === 0 ? (
                  <li className="text-sm text-text-secondary">
                    No mock employees in this department.
                  </li>
                ) : (
                  deptEmployees.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-xl border border-border-soft px-3 py-2 text-sm"
                    >
                      {e.firstName} {e.lastName} · {e.designation} ·{' '}
                      {e.employmentStatus}
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Feature name="employee.organization.edit">
              <Button
                type="button"
                className="gap-2"
                onClick={() => {
                  setTeamForm({
                    name: '',
                    departmentId: departments[0]?.id ?? '',
                    leaderName: '',
                    members: '',
                  })
                  setTeamFormOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Create Team
              </Button>
            </Feature>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <Card key={team.id} className="border-border-soft shadow-sm">
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>
                    {team.departmentName} · Leader: {team.leaderName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-xs font-medium text-text-secondary">
                    Assigned employees
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {team.memberNames.map((m) => (
                      <Badge key={m} variant="secondary">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="designations" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Feature name="employee.organization.edit">
              <Button
                type="button"
                className="gap-2"
                onClick={() => setDesignationFormOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Designation
              </Button>
            </Feature>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-navy">{d.title}</TableCell>
                  <TableCell>{d.departmentName}</TableCell>
                  <TableCell>{d.level}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="roles" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Feature name="employee.organization.edit">
              <Button
                type="button"
                className="gap-2"
                onClick={() => setRoleFormOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Job Role
              </Button>
            </Feature>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobRoles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-navy">{r.title}</TableCell>
                  <TableCell>
                    {designations.find((d) => d.id === r.designationId)?.title ??
                      r.designationId}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {r.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Reporting hierarchy</CardTitle>
              <CardDescription>Who reports to whom (mock)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {hierarchyMock.map((node) => {
                  const manager = hierarchyMock.find((h) => h.id === node.reportsTo)
                  return (
                    <li
                      key={node.id}
                      className="rounded-xl border border-border-soft px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-navy">{node.name}</span>
                      <span className="text-text-secondary"> · {node.role}</span>
                      <p className="mt-1 text-xs text-text-secondary">
                        Reports to: {manager ? manager.name : '— (top level)'}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="org-chart" className="mt-4">
          <Card className="border-border-soft shadow-sm">
            <CardHeader>
              <CardTitle>Organizational chart</CardTitle>
              <CardDescription>
                Simplified tree view from reporting hierarchy mock data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrgTree />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Approved by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transferHistoryMock.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-navy">
                    {t.employeeName}
                  </TableCell>
                  <TableCell>{t.fromDepartment}</TableCell>
                  <TableCell>{t.toDepartment}</TableCell>
                  <TableCell>{t.transferredOn}</TableCell>
                  <TableCell>{t.approvedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <Dialog open={deptFormOpen} onOpenChange={setDeptFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDeptId ? 'Edit Department' : 'Create Department'}
            </DialogTitle>
            <DialogDescription>
              Assign a department head and description. UI session only.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={deptForm.name}
                onChange={(e) =>
                  setDeptForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Department Head</Label>
              <Input
                value={deptForm.headName}
                onChange={(e) =>
                  setDeptForm((f) => ({ ...f, headName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={deptForm.description}
                onChange={(e) =>
                  setDeptForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeptFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveDept}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteDept)}
        onOpenChange={(open) => !open && setDeleteDept(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete department?</DialogTitle>
            <DialogDescription>
              Removes “{deleteDept?.name}” from the local mock list. Requires
              organization edit permission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDept(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmDeleteDept}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={teamFormOpen} onOpenChange={setTeamFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Assign a team leader and employees (comma-separated names).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Team name</Label>
              <Input
                value={teamForm.name}
                onChange={(e) =>
                  setTeamForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={teamForm.departmentId}
                onValueChange={(v) =>
                  setTeamForm((f) => ({ ...f, departmentId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Team Leader</Label>
              <Input
                value={teamForm.leaderName}
                onChange={(e) =>
                  setTeamForm((f) => ({ ...f, leaderName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Employees</Label>
              <Textarea
                rows={2}
                placeholder="Comma-separated names"
                value={teamForm.members}
                onChange={(e) =>
                  setTeamForm((f) => ({ ...f, members: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTeamFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveTeam}>
              Save Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={designationFormOpen} onOpenChange={setDesignationFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Designation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={designationForm.title}
                onChange={(e) =>
                  setDesignationForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={designationForm.departmentName}
                onValueChange={(v) =>
                  setDesignationForm((f) => ({ ...f, departmentName: v }))
                }
              >
                <SelectTrigger>
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
                value={designationForm.level}
                onChange={(e) =>
                  setDesignationForm((f) => ({ ...f, level: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDesignationFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveDesignation}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleFormOpen} onOpenChange={setRoleFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Job Role</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={roleForm.title}
                onChange={(e) =>
                  setRoleForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Select
                value={roleForm.designationId}
                onValueChange={(v) =>
                  setRoleForm((f) => ({ ...f, designationId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={roleForm.description}
                onChange={(e) =>
                  setRoleForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRoleFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveRole}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OrgTree() {
  const roots = hierarchyMock.filter((n) => n.reportsTo === null)

  const childrenOf = (id: string) =>
    hierarchyMock.filter((n) => n.reportsTo === id)

  const renderNode = (id: string, depth: number) => {
    const node = hierarchyMock.find((n) => n.id === id)
    if (!node) return null
    return (
      <li key={node.id} className="space-y-2">
        <div
          className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm shadow-sm"
          style={{ marginLeft: depth * 16 }}
        >
          <p className="font-medium text-navy">{node.name}</p>
          <p className="text-xs text-text-secondary">{node.role}</p>
        </div>
        <ul className="space-y-2">
          {childrenOf(node.id).map((child) => renderNode(child.id, depth + 1))}
        </ul>
      </li>
    )
  }

  return <ul className="space-y-3">{roots.map((r) => renderNode(r.id, 0))}</ul>
}
