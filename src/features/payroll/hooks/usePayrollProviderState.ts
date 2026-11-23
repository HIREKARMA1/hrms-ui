/**
 * State and actions for PayrollProvider — keeps the provider file small.
 * Used only by PayrollProvider in context/PayrollProvider.tsx.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { PAYROLL_STAGES } from '../constants/payrollStages'
import { companyDefaultSettings } from '../services/companyDefaults'
import {
  getRevisions,
  saveSalaryStructure,
  saveSettings,
  updateEmployeeMonthlyInputs,
} from '../services/payrollService'
import type { EmployeeMonthlyInputsPatch } from '../services/payrollService'
import type { FinalSettlement } from '../types/finalSettlement'
import type { PayrollEmployee, PayrollStage } from '../types/payroll'
import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure } from '../types/salaryStructure'
import type { BonusRun, IncentiveEntry, OvertimeEntry } from '../types/variablePay'
import { buildAlerts } from '../utils/buildAlerts'
import { enrichEmployees } from '../utils/calculatePayroll'
import { defaultPayrollMonth } from '../utils/defaultPayrollMonth'
import { filterEmployeesForPayrollMonth } from '../utils/employeeExit'
import { summarizePayroll } from '../utils/summarizePayroll'
import { applyStatusChange } from './payrollActions'
import { loadPayrollBundle } from './loadPayrollBundle'
import { usePayrollVariablePayActions } from './usePayrollVariablePayActions'

export function usePayrollProviderState() {
  const [rawEmployees, setRawEmployees] = useState<PayrollEmployee[]>([])
  const [settings, setSettings] = useState<PayrollSettings>(companyDefaultSettings)
  const [structures, setStructures] = useState<SalaryStructure[]>([])
  const [overtime, setOvertime] = useState<OvertimeEntry[]>([])
  const [incentives, setIncentives] = useState<IncentiveEntry[]>([])
  const [bonusRuns, setBonusRuns] = useState<BonusRun[]>([])
  const [settlements, setSettlements] = useState<FinalSettlement[]>([])
  const [payrollMonth, setPayrollMonth] = useState(defaultPayrollMonth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payrollStage, setPayrollStage] = useState<PayrollStage>('Approved')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [runDialogOpen, setRunDialogOpen] = useState(false)

  const variablePayActions = usePayrollVariablePayActions({
    setOvertime,
    setIncentives,
    setBonusRuns,
    setSettlements,
  })

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    loadPayrollBundle()
      .then((bundle) => {
        setRawEmployees(bundle.employees)
        setSettings(bundle.settings)
        setStructures(bundle.structures)
        setOvertime(bundle.overtime)
        setIncentives(bundle.incentives)
        setBonusRuns(bundle.bonusRuns)
        setSettlements(bundle.settlements)
        setLoading(false)
      })
      .catch((cause: Error) => {
        setError(cause.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => load(), 0)
    return () => window.clearTimeout(handle)
  }, [load])

  const payrollEmployees = useMemo(
    () => filterEmployeesForPayrollMonth(rawEmployees, settlements, payrollMonth),
    [rawEmployees, settlements, payrollMonth],
  )

  const employees = useMemo(
    () =>
      enrichEmployees(
        payrollEmployees,
        settings,
        structures,
        payrollMonth,
        overtime,
        bonusRuns,
        incentives,
      ),
    [payrollEmployees, settings, structures, payrollMonth, overtime, bonusRuns, incentives],
  )

  const summary = useMemo(() => summarizePayroll(employees), [employees])
  const alerts = useMemo(() => buildAlerts(employees), [employees])

  const updateStatus = useCallback((id: string, status: PayrollEmployee['status']) => {
    setRawEmployees((current) => applyStatusChange(current, id, status))
  }, [])

  const advancePayrollStage = useCallback(() => {
    const index = PAYROLL_STAGES.indexOf(payrollStage)
    if (index < PAYROLL_STAGES.length - 1) {
      setPayrollStage(PAYROLL_STAGES[index + 1])
    }
  }, [payrollStage])

  const handleSaveSettings = useCallback(async (next: PayrollSettings) => {
    setSettings(await saveSettings(next))
  }, [])

  const handleSaveStructure = useCallback(
    async (structure: SalaryStructure, reason: string) => {
      const saved = await saveSalaryStructure(structure, reason)
      setStructures((current) =>
        current.map((item) => (item.id === saved.id ? saved : item)),
      )
    },
    [],
  )

  const handleUpdateEmployeeMonthlyInputs = useCallback(
    async (employeeId: string, patch: EmployeeMonthlyInputsPatch) => {
      const saved = await updateEmployeeMonthlyInputs(employeeId, patch)
      setRawEmployees((current) =>
        current.map((item) => (item.id === saved.id ? saved : item)),
      )
    },
    [],
  )

  return {
    employees,
    rawEmployees,
    settings,
    structures,
    overtime,
    incentives,
    bonusRuns,
    settlements,
    payrollMonth,
    setPayrollMonth,
    summary,
    alerts,
    loading,
    error,
    reload: load,
    saveSettings: handleSaveSettings,
    saveSalaryStructure: handleSaveStructure,
    updateEmployeeMonthlyInputs: handleUpdateEmployeeMonthlyInputs,
    fetchRevisions: getRevisions,
    payrollStage,
    setPayrollStage,
    advancePayrollStage,
    selectedEmployeeId,
    setSelectedEmployeeId,
    markAsPaid: (id: string) => updateStatus(id, 'Paid'),
    holdSalary: (id: string) => updateStatus(id, 'On Hold'),
    retryPayment: (id: string) => updateStatus(id, 'Pending'),
    releaseSalary: (id: string) => updateStatus(id, 'Pending'),
    runDialogOpen,
    setRunDialogOpen,
    ...variablePayActions,
  }
}
