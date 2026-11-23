# Payroll Management (UI)

Single-company payroll: Overview run, salary structures, variable pay, full & final settlement, and statutory settings. Mock data lives behind `services/payrollService.ts`.

## Folder structure

- `pages/` — `PayrollPage` with sidebar URL sections (`usePayrollRoute`, `payrollSectionRoutes.ts`)
- `components/overview/` — Overview sections (layout unchanged except main tab bar)
- `components/variablePay/` — Overtime, bonus runs, incentives (segmented sub-tabs)
- `components/settlement/` — F&F list and centered detail dialog
- `components/settings/` — Salary/statutory form plus variable pay and settlement rule cards
- `components/structures/` — Structures table, editor, labour-code warning
- `components/shared/` — Tab headers and month label helpers
- `constants/` — Salary components, approval status pill tokens, bonus/incentive labels
- `types/` — Payroll, settings, variable pay, final settlement models
- `utils/` — Payroll calc with variable pay, settlement math, bonus preview builder
- `services/` — Mock store, variable pay APIs, leave encashment stub
- `hooks/` — Provider state, variable pay actions, segment and page tabs

## Navigation (Phase A–B)

- Sidebar children by role → `utils/payrollNavChildren.ts`, `payrollTabsForRole` in `hooks/usePayrollPageTabs.ts`
- Viewer identity → shared `LeaveViewerProvider` (Redux auth user when signed in); `PayrollPageHeader` shows `LeaveDemoViewSelect` only for unauthenticated demo viewers
- Section slugs → `utils/payrollSectionRoutes.ts` (includes `/payroll/my-payslips` for Employee)
- Active section hook → `hooks/usePayrollRoute.ts` (role-aware redirect off `/payroll` for non-HR)

| Role | Sidebar sections |
|------|------------------|
| HR Admin / Super Admin | Overview, Structures, Variable Pay, Settlement, Settings |
| Manager | Overview, Variable Pay |
| Employee | My Payslips (demo: Arjun EMP-1006, active in payroll mocks) |

## Where to change things

- Table styling (headers, row hover, money columns) → `components/shared/payrollTableLayout.ts` and `payrollUi.ts`
- Stat cards (labels, icon tiles, tones) → `components/shared/PayrollStatGrid.tsx` and Overview `SummaryCards.tsx`
- Status pills (colors, contrast, dots) → `constants/approvalStatuses.ts`, `constants/paymentStatuses.ts`, `ApprovalStatusPill.tsx`, `StatusPill.tsx`
- Row and header buttons (approve/reject/links, lavender secondary) → `components/shared/PayrollRowActions.tsx` and `payrollUi.ts`
- Payroll modals (overlay, header/footer, selects, Cancel) → `components/shared/PayrollDialog.tsx`, `PayrollDialogField.tsx`, dialog tokens in `payrollUi.ts`
- Statutory & variable pay seeds → `services/companyDefaults.ts` or **Payroll Settings** (sections, related tab links, unsaved `payrollSettingsUnsavedBridge` + leave guard hook, validation → section in `utils/validatePayrollSettings.ts`)
- Overtime rate / cap → **Payroll Settings** → Overtime rules card
- Bonus statutory % and ceilings → Bonus rules card; mock runs → `services/mockBonusRuns.ts`
- Variable pay in monthly gross → approved rows only; aggregation → `utils/variablePayCalculations.ts`
- PF / ESI / PT on variable pay → Variable pay treatment card + `utils/computePayrollWithOptions.ts`
- Connect leave balances → `services/leaveEncashment.ts` (`getEncashableLeaveDays`)
- Mock overtime / incentives / settlements → `services/mockVariablePay.ts`, `mockFinalSettlements.ts`
- Calculations entry point → `utils/calculatePayroll.ts`
- Connect API → `services/payrollService.ts` (facade)

## Variable pay in payroll

Approved overtime and incentives for the selected month, plus bonus runs in **Approved** or **Paid** status for that payout month, feed `enrichEmployees`. Draft bonus runs are excluded. Overview summary, table, breakdown, and structure preview stay aligned via the same enriched employee list.
