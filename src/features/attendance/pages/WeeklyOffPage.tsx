import { Save } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ToastBanner, useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

import { departments, weeklyOffConfigs as initialConfigs } from '../mocks/attendanceMocks'
import type { WeeklyOffConfig } from '../types/attendance'

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

type WeeklyOffScope = WeeklyOffConfig['scope']

const departmentOptions = departments.filter((d) => d !== 'All')

export function WeeklyOffPage() {
  const { message, toast } = useToast()
  const [configs, setConfigs] = useState<WeeklyOffConfig[]>(initialConfigs)
  const [scope, setScope] = useState<WeeklyOffScope>('Organization')
  const [departmentTarget, setDepartmentTarget] = useState(departmentOptions[0] ?? 'Engineering')
  const [employeeTarget, setEmployeeTarget] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>(['Sunday'])
  const [rotational, setRotational] = useState(false)

  const resolvedTarget = useMemo(() => {
    if (scope === 'Organization') return 'All Departments'
    if (scope === 'Department') return departmentTarget
    return employeeTarget.trim()
  }, [scope, departmentTarget, employeeTarget])

  const toggleDay = (day: string, checked: boolean) => {
    setSelectedDays((prev) =>
      checked ? [...prev, day] : prev.filter((d) => d !== day),
    )
  }

  const handleSave = () => {
    if (scope === 'Employee' && !employeeTarget.trim()) {
      toast('Enter an employee ID or name for the selected scope.')
      return
    }
    if (selectedDays.length === 0) {
      toast('Select at least one weekly off day.')
      return
    }

    const entry: WeeklyOffConfig = {
      scope,
      target: resolvedTarget,
      days: [...selectedDays],
      rotational,
    }
    setConfigs((prev) => [...prev, entry])
    toast('Weekly off configuration saved (UI preview).')
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <ToastBanner message={message} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Weekly Off</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Configure organization, department, or employee-level weekly off policies.
        </p>
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="text-navy">Configure Weekly Offs</CardTitle>
          <CardDescription>
            Choose scope, target, off days, and whether the pattern is rotational.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weekly-off-scope">Scope</Label>
              <Select
                value={scope}
                onValueChange={(v) => setScope(v as WeeklyOffScope)}
              >
                <SelectTrigger id="weekly-off-scope">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Organization">Organization</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly-off-target">Target</Label>
              {scope === 'Organization' && (
                <Input
                  id="weekly-off-target"
                  readOnly
                  value="All Departments"
                  className="bg-muted-bg"
                />
              )}
              {scope === 'Department' && (
                <Select
                  value={departmentTarget}
                  onValueChange={(value) => setDepartmentTarget(value as typeof departmentTarget)}
                >
                  <SelectTrigger id="weekly-off-target">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {scope === 'Employee' && (
                <Input
                  id="weekly-off-target"
                  placeholder="EMP-1001 · Employee name"
                  value={employeeTarget}
                  onChange={(e) => setEmployeeTarget(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Weekly off days</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {WEEKDAYS.map((day) => {
                const checked = selectedDays.includes(day)
                return (
                  <label
                    key={day}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-xl border border-border-soft px-3 py-2.5 text-sm transition-colors',
                      checked && 'border-brand-500/40 bg-lavender',
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => toggleDay(day, v === true)}
                    />
                    <span className="font-medium text-navy">{day.slice(0, 3)}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-app-bg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-navy">Rotational weekly off</p>
              <p className="text-xs text-text-secondary">
                Alternate off days across team members on a rolling schedule.
              </p>
            </div>
            <Switch checked={rotational} onCheckedChange={setRotational} />
          </div>

          <div className="flex justify-end">
            <Button type="button" className="gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="text-navy">Saved configurations</CardTitle>
          <CardDescription>Mock table — new rows append when you save.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-soft text-text-secondary">
                <th className="px-3 py-2 font-medium">Scope</th>
                <th className="px-3 py-2 font-medium">Target</th>
                <th className="px-3 py-2 font-medium">Days</th>
                <th className="px-3 py-2 font-medium">Rotational</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((row, index) => (
                <tr
                  key={`${row.scope}-${row.target}-${index}`}
                  className="border-b border-border-soft/80 last:border-0"
                >
                  <td className="px-3 py-3 font-medium text-navy">{row.scope}</td>
                  <td className="px-3 py-3 text-navy">{row.target}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {row.days.map((day) => (
                        <Badge key={day} variant="secondary" className="bg-lavender text-brand-600">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={row.rotational ? 'success' : 'outline'}>
                      {row.rotational ? 'Yes' : 'No'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

export default WeeklyOffPage
