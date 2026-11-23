/**
 * Loads company weekly-off policy, edits draft rules, and saves via POST /calendar/weekly-offs.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  useConfigureWeeklyOffMutation,
  useGetWeeklyOffPolicyQuery,
} from '@/features/officeCalendar/api/weeklyOffsApi'
import { useCanConfigureWeeklyOff } from '@/features/officeCalendar/hooks/useCanConfigureWeeklyOff'
import { useShouldFetchWeeklyOffPolicy } from '@/features/officeCalendar/hooks/useShouldFetchWeeklyOffPolicy'
import type { WeeklyOffRule } from '@/features/officeCalendar/types/api/weeklyOffs.types'

import { validateWeeklyOffDraft } from '../utils/validateWeeklyOffDraft'
import { weeklyOffRuleKey } from '../utils/weeklyOffRuleLabels'

function cloneRules(rules: WeeklyOffRule[]): WeeklyOffRule[] {
  return rules.map((r) => ({ ...r }))
}

function rulesEqual(a: WeeklyOffRule[], b: WeeklyOffRule[]): boolean {
  if (a.length !== b.length) return false
  const keysA = a.map(weeklyOffRuleKey).sort().join('|')
  const keysB = b.map(weeklyOffRuleKey).sort().join('|')
  return keysA === keysB
}

export function useWeeklyOffPolicyForm() {
  const canFetch = useShouldFetchWeeklyOffPolicy()
  const canConfigure = useCanConfigureWeeklyOff()
  const {
    data: policy,
    isFetching,
    isError,
    refetch,
  } = useGetWeeklyOffPolicyQuery(undefined, { skip: !canFetch })
  const [configure, configureState] = useConfigureWeeklyOffMutation()

  const [draftRules, setDraftRules] = useState<WeeklyOffRule[]>([])

  useEffect(() => {
    if (!canFetch) {
      setDraftRules([])
      return
    }
    if (!policy) return
    setDraftRules((draft) => {
      if (rulesEqual(draft, policy.rules)) return draft
      if (draft.length > 0) return draft
      return cloneRules(policy.rules)
    })
  }, [canFetch, policy])

  const savedRules = policy?.rules ?? []
  const isDirty = useMemo(() => !rulesEqual(draftRules, savedRules), [draftRules, savedRules])

  const setRuleAt = useCallback((index: number, rule: WeeklyOffRule) => {
    setDraftRules((prev) => prev.map((item, i) => (i === index ? rule : item)))
  }, [])

  const addRule = useCallback(() => {
    setDraftRules((prev) => [...prev, { weekday: 'SUNDAY' }])
  }, [])

  const removeRule = useCallback((index: number) => {
    setDraftRules((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const resetDraft = useCallback(() => {
    setDraftRules(cloneRules(savedRules))
  }, [savedRules])

  const save = useCallback(async (): Promise<string | null> => {
    const validation = validateWeeklyOffDraft(draftRules)
    if (!validation.ok) return validation.message
    if (!canConfigure) return 'You need calendar:configure to save weekly-off policy.'
    try {
      const saved = await configure({ rules: draftRules }).unwrap()
      setDraftRules(cloneRules(saved.rules))
      return null
    } catch {
      return 'Could not save weekly-off policy. Check your permissions and try again.'
    }
  }, [canConfigure, configure, draftRules])

  const policyReady = canFetch && !isError && policy !== undefined

  return {
    canFetch,
    canConfigure,
    policyReady,
    isFetching,
    isError,
    refetch,
    isSaving: configureState.isLoading,
    draftRules,
    setRuleAt,
    addRule,
    removeRule,
    resetDraft,
    isDirty,
    save,
    policyTimezone: policy?.timezone,
    policyUpdatedAt: policy?.updatedAt,
  }
}