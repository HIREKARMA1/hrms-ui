import {
  CalendarDays,
  Clock3,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

import type { ManagedPermission } from '../types/permissionManagement.types'
import {
  formatModuleLabel,
  formatPermissionDate,
  getModuleBadgeClass,
} from '../utils/moduleBadgeStyles'

type PermissionDetailsDrawerProps = {
  permission: ManagedPermission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PermissionDetailsDrawer({
  permission,
  open,
  onOpenChange,
}: PermissionDetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border-soft px-4 py-5 pr-12 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] text-brand-500">
              <Shield className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <SheetTitle className="truncate text-xl font-bold text-navy">
              Permission Details
            </SheetTitle>
          </div>
        </SheetHeader>

        {permission ? (
          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0EDFF] text-brand-500">
                <CalendarDays className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 space-y-2">
                <p
                  className="truncate text-lg font-bold tracking-tight text-navy"
                  title={permission.code}
                >
                  {permission.code}
                </p>
                <Badge
                  variant="secondary"
                  className={cn(
                    'border-0 font-medium',
                    getModuleBadgeClass(permission.module),
                  )}
                >
                  {formatModuleLabel(permission.module)}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border-soft bg-[#FAFBFD] p-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-text-secondary uppercase">
                  Description
                </p>
                <p className="mt-1 text-sm break-words text-navy">
                  {permission.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-text-secondary uppercase">
                  Role Usage
                </p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                  <Users className="h-3.5 w-3.5" strokeWidth={2} />
                  {permission.roleCount}{' '}
                  {permission.roleCount === 1 ? 'Role' : 'Roles'}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
                  <div>
                    <p className="text-xs font-medium text-text-secondary">
                      Created At
                    </p>
                    <p className="text-sm text-navy">
                      {formatPermissionDate(permission.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
                  <div>
                    <p className="text-xs font-medium text-text-secondary">
                      Updated At
                    </p>
                    <p className="text-sm text-navy">
                      {formatPermissionDate(permission.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-navy">
                Related Roles
              </p>
              {permission.roleCount === 0 ? (
                <p className="rounded-xl border border-border-soft bg-[#FAFBFD] px-3 py-4 text-sm text-text-secondary">
                  This permission is not assigned to any roles.
                </p>
              ) : (
                <p className="rounded-xl border border-border-soft bg-[#FAFBFD] px-3 py-4 text-sm text-text-secondary">
                  Assigned to{' '}
                  <span className="font-semibold text-navy tabular-nums">
                    {permission.roleCount}
                  </span>{' '}
                  {permission.roleCount === 1 ? 'role' : 'roles'} across the
                  organization.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
