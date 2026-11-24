import { Eye, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TablePagination } from '@/components/ui/table-pagination'
import { cn } from '@/lib/utils'

import type { ManagedRole } from '../types/roleManagement.types'

type RolesTableProps = {
  roles: ManagedRole[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onView: (role: ManagedRole) => void
  onEdit: (role: ManagedRole) => void
  onDelete: (role: ManagedRole) => void
}

export function RolesTable({
  roles,
  page,
  pageSize,
  total,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: RolesTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[860px] table-fixed">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[28%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Role Name</TableHead>
              <TableHead className="px-4">Description</TableHead>
              <TableHead className="px-4 text-center">Type</TableHead>
              <TableHead className="px-4 text-center">Permissions</TableHead>
              <TableHead className="px-4 text-center">Users</TableHead>
              <TableHead className="px-4 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm text-text-secondary"
                >
                  No roles match your filters.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                const primaryLabel = role.code || role.name
                const showNameSubtext =
                  Boolean(role.name?.trim()) &&
                  role.name.trim().toUpperCase() !== role.code.toUpperCase()

                return (
                  <TableRow key={role.id}>
                    <TableCell className="px-4 align-middle">
                      <div className="min-w-0">
                        <p
                          className="truncate font-semibold tracking-wide text-navy"
                          title={primaryLabel}
                        >
                          {primaryLabel}
                        </p>
                        {showNameSubtext ? (
                          <p
                            className="truncate text-xs text-text-secondary"
                            title={role.name}
                          >
                            {role.name}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 align-middle text-text-secondary">
                      <p
                        className="line-clamp-2 break-words"
                        title={role.description || undefined}
                      >
                        {role.description || '—'}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 text-center align-middle">
                      <div className="flex justify-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'border-0 font-medium whitespace-nowrap',
                            role.type === 'system'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-[#F0EDFF] text-[#5938DB]',
                          )}
                        >
                          {role.type === 'system' ? 'System' : 'Custom'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-center align-middle tabular-nums text-navy">
                      {role.permissionCount}
                    </TableCell>
                    <TableCell className="px-4 text-center align-middle tabular-nums text-navy">
                      {role.userCount}
                    </TableCell>
                    <TableCell className="px-4 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-text-secondary hover:text-navy"
                          title="View"
                          aria-label={`View ${primaryLabel}`}
                          onClick={() => onView(role)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-text-secondary hover:text-navy"
                          title="Edit"
                          aria-label={`Edit ${primaryLabel}`}
                          onClick={() => onEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:text-rose-300"
                          title={
                            role.type === 'system'
                              ? 'System roles cannot be deleted'
                              : role.userCount > 0
                                ? 'Remove user assignments first'
                                : 'Delete'
                          }
                          aria-label={`Delete ${primaryLabel}`}
                          disabled={
                            role.type === 'system' || role.userCount > 0
                          }
                          onClick={() => onDelete(role)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        className="border-t border-border-soft px-4 py-3"
        page={page}
        totalPages={totalPages}
        total={total}
        itemLabel="roles"
        summary={
          total === 0
            ? 'No roles'
            : `Showing ${start}–${end} of ${total} roles`
        }
        onPageChange={onPageChange}
      />
    </div>
  )
}
