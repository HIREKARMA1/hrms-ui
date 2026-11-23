/**
 * Context actions for overtime, bonus, incentives, and settlements mock APIs.
 * Composed into usePayrollProviderState by PayrollProvider.
 */

import { useCallback, type Dispatch, type SetStateAction } from 'react'

import {
  saveBonusRun,
  saveFinalSettlement,
  saveIncentiveEntry,
  saveOvertimeEntry,
  setBonusRunStatus,
  setIncentiveStatus,
  setOvertimeStatus,
  setSettlementStatus,
} from '../services/payrollService'
import type { FinalSettlement, SettlementStatus } from '../types/finalSettlement'
import type {
  BonusRun,
  IncentiveEntry,
  ItemApprovalStatus,
  OvertimeEntry,
} from '../types/variablePay'

type VariablePayState = {
  setOvertime: Dispatch<SetStateAction<OvertimeEntry[]>>
  setIncentives: Dispatch<SetStateAction<IncentiveEntry[]>>
  setBonusRuns: Dispatch<SetStateAction<BonusRun[]>>
  setSettlements: Dispatch<SetStateAction<FinalSettlement[]>>
}

export function usePayrollVariablePayActions({
  setOvertime,
  setIncentives,
  setBonusRuns,
  setSettlements,
}: VariablePayState) {
  const upsertOvertime = useCallback(async (entry: OvertimeEntry) => {
    const saved = await saveOvertimeEntry(entry)
    setOvertime((rows) => {
      const index = rows.findIndex((item) => item.id === saved.id)
      if (index >= 0) {
        const next = [...rows]
        next[index] = saved
        return next
      }
      return [saved, ...rows]
    })
    return saved
  }, [setOvertime])

  const updateOvertimeStatus = useCallback(
    async (id: string, status: ItemApprovalStatus, reason?: string) => {
      const saved = await setOvertimeStatus(id, status, reason)
      setOvertime((rows) => rows.map((item) => (item.id === id ? saved : item)))
      return saved
    },
    [setOvertime],
  )

  const upsertIncentive = useCallback(async (entry: IncentiveEntry) => {
    const saved = await saveIncentiveEntry(entry)
    setIncentives((rows) => {
      const index = rows.findIndex((item) => item.id === saved.id)
      if (index >= 0) {
        const next = [...rows]
        next[index] = saved
        return next
      }
      return [saved, ...rows]
    })
    return saved
  }, [setIncentives])

  const updateIncentiveStatus = useCallback(
    async (id: string, status: ItemApprovalStatus, reason?: string) => {
      const saved = await setIncentiveStatus(id, status, reason)
      setIncentives((rows) => rows.map((item) => (item.id === id ? saved : item)))
      return saved
    },
    [setIncentives],
  )

  const upsertBonusRun = useCallback(async (run: BonusRun) => {
    const saved = await saveBonusRun(run)
    setBonusRuns((rows) => {
      const index = rows.findIndex((item) => item.id === saved.id)
      if (index >= 0) {
        const next = [...rows]
        next[index] = saved
        return next
      }
      return [saved, ...rows]
    })
    return saved
  }, [setBonusRuns])

  const updateBonusRunStatus = useCallback(
    async (id: string, status: BonusRun['status']) => {
      const saved = await setBonusRunStatus(id, status)
      setBonusRuns((rows) => rows.map((item) => (item.id === id ? saved : item)))
      return saved
    },
    [setBonusRuns],
  )

  const upsertSettlement = useCallback(async (settlement: FinalSettlement) => {
    const saved = await saveFinalSettlement(settlement)
    setSettlements((rows) => {
      const index = rows.findIndex((item) => item.id === saved.id)
      if (index >= 0) {
        const next = [...rows]
        next[index] = saved
        return next
      }
      return [saved, ...rows]
    })
    return saved
  }, [setSettlements])

  const updateSettlementStatus = useCallback(
    async (id: string, status: SettlementStatus, reason?: string) => {
      const saved = await setSettlementStatus(id, status, reason)
      setSettlements((rows) => rows.map((item) => (item.id === id ? saved : item)))
      return saved
    },
    [setSettlements],
  )

  return {
    upsertOvertime,
    updateOvertimeStatus,
    upsertIncentive,
    updateIncentiveStatus,
    upsertBonusRun,
    updateBonusRunStatus,
    upsertSettlement,
    updateSettlementStatus,
  }
}
