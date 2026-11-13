/**
 * Local draft state and manual line edits for the settlement sheet.
 * Used by SettlementDetailPanel while status is Draft.
 */

import { useCallback, useEffect, useState } from 'react'

import type { FinalSettlement, SettlementLine } from '../types/finalSettlement'
import { mergeSettlementLines } from '../utils/computeSettlementLines'
import { validateExitDates } from '../utils/noticeDays'
import { applySettlementTotals } from '../utils/settlementTotals'
import { roundMoney } from '../utils/roundMoney'

export function useSettlementEditor(initial: FinalSettlement | null) {
  const [draft, setDraft] = useState<FinalSettlement | null>(initial)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDraft(initial ? structuredClone(initial) : null)
    }, 0)
    return () => window.clearTimeout(handle)
  }, [initial])

  const dateError = draft
    ? validateExitDates(draft.resignationDate, draft.lastWorkingDay)
    : null

  const applyAutoRecalc = useCallback(
    (earnings: SettlementLine[], deductions: SettlementLine[]) => {
      setDraft((current) => {
        if (!current) {
          return current
        }
        return applySettlementTotals({
          ...current,
          ...mergeSettlementLines(earnings, deductions, current),
        })
      })
    },
    [],
  )

  const patchExit = useCallback((patch: Partial<FinalSettlement>) => {
    setDraft((current) => {
      if (!current) {
        return current
      }
      const next = { ...current, ...patch }
      if (patch.resignationDate || patch.lastWorkingDay) {
        const start = new Date(next.resignationDate)
        const end = new Date(next.lastWorkingDay)
        const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
        next.noticeDaysServed = days
      }
      return next
    })
  }, [])

  const addManualLine = useCallback((kind: 'earnings' | 'deductions', label: string, amount: number) => {
    const line: SettlementLine = {
      id: `manual-${Date.now()}`,
      label,
      amount: roundMoney(amount),
      manual: true,
    }
    setDraft((current) => {
      if (!current) {
        return current
      }
      const key = kind === 'earnings' ? 'earningsLines' : 'deductionLines'
      return applySettlementTotals({ ...current, [key]: [...current[key], line] })
    })
  }, [])

  const removeLine = useCallback((kind: 'earnings' | 'deductions', id: string) => {
    setDraft((current) => {
      if (!current) {
        return current
      }
      const key = kind === 'earnings' ? 'earningsLines' : 'deductionLines'
      return applySettlementTotals({ ...current, [key]: current[key].filter((line) => line.id !== id) })
    })
  }, [])

  const setTds = useCallback((tds: number) => {
    setDraft((current) => {
      if (!current) {
        return current
      }
      return applySettlementTotals({ ...current, tds: roundMoney(tds) })
    })
  }, [])

  return { draft, setDraft, dateError, applyAutoRecalc, patchExit, addManualLine, removeLine, setTds }
}
