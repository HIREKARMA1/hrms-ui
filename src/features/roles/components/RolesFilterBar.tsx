import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { RoleTypeFilter } from '../types/roleManagement.types'

type RolesFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: RoleTypeFilter
  onTypeFilterChange: (value: RoleTypeFilter) => void
}

export function RolesFilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: RolesFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <Input
          className="pl-9"
          placeholder="Search roles..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <Select
        value={typeFilter}
        onValueChange={(value) => onTypeFilterChange(value as RoleTypeFilter)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
