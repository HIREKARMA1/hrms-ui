import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { formatModuleLabel } from '../utils/moduleBadgeStyles'

type PermissionsFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  moduleFilter: string
  onModuleFilterChange: (value: string) => void
  modules: string[]
  onApply: () => void
}

export function PermissionsFilterBar({
  search,
  onSearchChange,
  moduleFilter,
  onModuleFilterChange,
  modules,
  onApply,
}: PermissionsFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <Input
          className="pl-9"
          placeholder="Search permissions by code or description..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onApply()
          }}
        />
      </div>
      <Select value={moduleFilter} onValueChange={onModuleFilterChange}>
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder="All Modules" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modules</SelectItem>
          {modules.map((module) => (
            <SelectItem key={module} value={module}>
              {formatModuleLabel(module)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        className="w-full shrink-0 lg:w-auto"
        onClick={onApply}
      >
        Apply Filters
      </Button>
    </div>
  )
}
