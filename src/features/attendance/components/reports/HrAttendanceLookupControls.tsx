/**
 * Employee code / UUID lookup row for HR attendance reports.
 */
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { HrLookupMode } from '../../hooks/useHrAttendanceReportActive'

type HrAttendanceLookupControlsProps = {
  mode: HrLookupMode
  onModeChange: (mode: HrLookupMode) => void
  employeeCode: string
  onEmployeeCodeChange: (value: string) => void
  employeeId: string
  onEmployeeIdChange: (value: string) => void
  onSubmit: () => void
}

export function HrAttendanceLookupControls({
  mode,
  onModeChange,
  employeeCode,
  onEmployeeCodeChange,
  employeeId,
  onEmployeeIdChange,
  onSubmit,
}: HrAttendanceLookupControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label>Lookup by</Label>
        <Select value={mode} onValueChange={(value) => onModeChange(value as HrLookupMode)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="code">Employee code</SelectItem>
            <SelectItem value="id">Employee ID (UUID)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {mode === 'code' ? (
        <div className="space-y-1">
          <Label htmlFor="hr-att-emp-code">Employee code</Label>
          <Input
            id="hr-att-emp-code"
            value={employeeCode}
            placeholder="e.g. HK0030"
            className="w-[200px]"
            onChange={(event) => onEmployeeCodeChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSubmit()
            }}
          />
        </div>
      ) : (
        <div className="space-y-1">
          <Label htmlFor="hr-att-emp-id">Employee ID</Label>
          <Input
            id="hr-att-emp-id"
            value={employeeId}
            placeholder="Server employee UUID"
            className="min-w-[260px]"
            onChange={(event) => onEmployeeIdChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSubmit()
            }}
          />
        </div>
      )}
      <Button type="button" variant="outline" size="sm" className="gap-1" onClick={onSubmit}>
        <Search className="h-3.5 w-3.5" />
        Load report
      </Button>
    </div>
  )
}