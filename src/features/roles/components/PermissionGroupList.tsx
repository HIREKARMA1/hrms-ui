import {
  Briefcase,
  CalendarDays,
  ChevronDown,
  Clock,
  Shield,
  Users,
  Wallet,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import type {
  PermissionModule,
  RolePermissionId,
} from '../types/roleManagement.types'

const MODULE_ICONS = {
  users: Users,
  calendar: CalendarDays,
  wallet: Wallet,
  clock: Clock,
  briefcase: Briefcase,
  shield: Shield,
} as const

type PermissionGroupListProps = {
  modules: PermissionModule[]
  selectedIds: RolePermissionId[]
  onChange: (ids: RolePermissionId[]) => void
  readOnly?: boolean
  isLoading?: boolean
}

export function PermissionGroupList({
  modules,
  selectedIds,
  onChange,
  readOnly = false,
  isLoading = false,
}: PermissionGroupListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev }
      modules.forEach((module, index) => {
        if (next[module.id] === undefined) {
          // Expand the first module by default; keep the rest collapsed.
          next[module.id] = index === 0
        }
      })
      return next
    })
  }, [modules])

  const selectedSet = new Set(selectedIds)
  const allIds = modules.flatMap((module) =>
    module.permissions.map((permission) => permission.id),
  )
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedSet.has(id))
  const someSelected = allIds.some((id) => selectedSet.has(id)) && !allSelected

  const toggleId = (id: RolePermissionId, checked: boolean) => {
    if (readOnly) return
    if (checked) {
      onChange([...new Set([...selectedIds, id])])
      return
    }
    onChange(selectedIds.filter((current) => current !== id))
  }

  const toggleModule = (moduleId: string, checked: boolean) => {
    if (readOnly) return
    const module = modules.find((item) => item.id === moduleId)
    if (!module) return
    const moduleIds = module.permissions.map((permission) => permission.id)
    if (checked) {
      onChange([...new Set([...selectedIds, ...moduleIds])])
      return
    }
    onChange(selectedIds.filter((id) => !moduleIds.includes(id)))
  }

  const toggleSelectAll = (checked: boolean) => {
    if (readOnly) return
    onChange(checked ? [...allIds] : [])
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border-soft bg-[#FAFBFD] px-3 py-6 text-center text-sm text-text-secondary">
        Loading permissions…
      </div>
    )
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-border-soft bg-[#FAFBFD] px-3 py-6 text-center text-sm text-text-secondary">
        No permissions available.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-[#FAFBFD] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="select-all-permissions"
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            disabled={readOnly}
            onCheckedChange={(value) => toggleSelectAll(value === true)}
          />
          <Label
            htmlFor="select-all-permissions"
            className={cn(
              'cursor-pointer font-semibold text-navy',
              readOnly && 'cursor-default',
            )}
          >
            Select All
          </Label>
        </div>
        <span className="text-xs text-text-secondary tabular-nums">
          {selectedIds.length} / {allIds.length} selected
        </span>
      </div>

      <div className="space-y-2">
        {modules.map((module) => {
          const Icon = MODULE_ICONS[module.iconName]
          const moduleIds = module.permissions.map(
            (permission) => permission.id,
          )
          const moduleAllSelected = moduleIds.every((id) => selectedSet.has(id))
          const moduleSomeSelected =
            moduleIds.some((id) => selectedSet.has(id)) && !moduleAllSelected
          const isOpen = expanded[module.id] ?? true

          return (
            <div
              key={module.id}
              className="overflow-hidden rounded-xl border border-border-soft bg-white"
            >
              <div className="flex items-center gap-2 border-b border-border-soft bg-[#FAFBFD] px-3 py-2.5">
                <Checkbox
                  checked={
                    moduleAllSelected
                      ? true
                      : moduleSomeSelected
                        ? 'indeterminate'
                        : false
                  }
                  disabled={readOnly}
                  onCheckedChange={(value) =>
                    toggleModule(module.id, value === true)
                  }
                  aria-label={`Select all ${module.label}`}
                />
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [module.id]: !isOpen,
                    }))
                  }
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0EDFF] text-brand-500">
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">
                    {module.label}
                  </span>
                  <span className="text-xs text-text-secondary tabular-nums">
                    {
                      moduleIds.filter((id) => selectedSet.has(id)).length
                    }
                    /{moduleIds.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-text-secondary transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
              </div>

              {isOpen ? (
                <div className="grid gap-2 p-3 sm:grid-cols-2">
                  {module.permissions.map((permission) => {
                    const checked = selectedSet.has(permission.id)
                    const inputId = `${module.id}-${permission.id}`
                    return (
                      <label
                        key={permission.id}
                        htmlFor={inputId}
                        className={cn(
                          'flex items-start gap-2.5 rounded-lg border border-transparent px-2 py-1.5 transition-colors',
                          !readOnly &&
                            'cursor-pointer hover:border-border-soft hover:bg-[#FAFBFD]',
                          readOnly && 'cursor-default',
                        )}
                      >
                        <Checkbox
                          id={inputId}
                          checked={checked}
                          disabled={readOnly}
                          onCheckedChange={(value) =>
                            toggleId(permission.id, value === true)
                          }
                          className="mt-0.5"
                        />
                        <span className="text-sm text-navy">
                          {permission.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
