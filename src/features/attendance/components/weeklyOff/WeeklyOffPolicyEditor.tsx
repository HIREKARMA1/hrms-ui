/**
 * Edit and save company weekly-off rules (POST replaces full policy).
 */
import { Loader2, Plus, RotateCcw, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MAX_WEEKLY_OFF_RULES, type WeeklyOffRule } from '@/features/officeCalendar/types/api/weeklyOffs.types'

import { formatWeeklyOffRule } from '../../utils/weeklyOffRuleLabels'
import { WeeklyOffRuleRow } from './WeeklyOffRuleRow'

type WeeklyOffPolicyEditorProps = {
  rules: WeeklyOffRule[]
  canConfigure: boolean
  isDirty: boolean
  isSaving: boolean
  onAdd: () => void
  onChange: (index: number, rule: WeeklyOffRule) => void
  onRemove: (index: number) => void
  onReset: () => void
  onSave: () => void
}

export function WeeklyOffPolicyEditor({
  rules,
  canConfigure,
  isDirty,
  isSaving,
  onAdd,
  onChange,
  onRemove,
  onReset,
  onSave,
}: WeeklyOffPolicyEditorProps) {
  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="text-navy">Company weekly-off rules</CardTitle>
        <CardDescription>
          One policy for the whole company. Saving replaces all rules on the server (max{' '}
          {MAX_WEEKLY_OFF_RULES}).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rules.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-soft px-4 py-6 text-center text-sm text-text-secondary">
            No weekly-off rules. Add a rule or save an empty policy to clear weekly offs.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {rules.map((rule, index) => (
              <WeeklyOffRuleRow
                key={`${index}-${rule.weekday}-${rule.occurrence ?? 'e'}`}
                index={index}
                rule={rule}
                disabled={!canConfigure || isSaving}
                onChange={(next) => onChange(index, next)}
                onRemove={() => onRemove(index)}
              />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={!canConfigure || isSaving || rules.length >= MAX_WEEKLY_OFF_RULES}
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            Add rule
          </Button>
          {isDirty ? (
            <Badge variant="secondary" className="self-center bg-lavender text-brand-600">
              Unsaved changes
            </Badge>
          ) : null}
        </div>
        {rules.length > 0 ? (
          <div className="rounded-xl border border-border-soft bg-muted-bg/40 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Preview
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-navy">
              {rules.map((rule, i) => (
                <li key={`preview-${i}`}>{formatWeeklyOffRule(rule)}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-border-soft pt-4">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={!canConfigure || isSaving || !isDirty}
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            type="button"
            className="gap-2"
            disabled={!canConfigure || isSaving || !isDirty}
            onClick={onSave}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save policy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}