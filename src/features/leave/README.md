# Leave Management (UI)

Single-company leave: balances, requests, approvals, calendar, accruals, and policy settings. Signed-in users get server data (RTK Query, `api/`); demo routes keep the mock store behind `services/leaveService.ts`.

## Server data (signed-in users)

- Endpoints → `api/leaveApi.ts` (injected into `baseApi`); backend contracts in `api/leaveApi.types.ts`; pure request/response mapping in `api/leaveMappers.ts`. Bodies that fail the strict readers become `LEAVE_INVALID_RESPONSE` errors, never data.
- Snapshot → `hooks/useLeaveProviderState.ts` picks `hooks/useLeaveApiSnapshot.ts` when `viewer.source === 'authenticated'`. `services/leaveApiSnapshot.ts` decides which reads run (`resolveLeaveApiAccess`) and builds the `LeaveSnapshot`; `snapshot.api` marks server mode.
- Server mutations → `hooks/useLeaveApiActions.ts` (apply, approve, reject, cancel, encashment approve/reject, balance adjustment, accrual / carry-forward / expiry runs). Every action resolves to `{ ok, message }`.
- Server-only screens → `components/balances/ApiBalancesTab.tsx`, `components/accruals/ApiAccrualsTab.tsx`, `components/settings/ApiLeaveSettingsTab.tsx`; calendar data in `hooks/useServerLeaveCalendar.ts`.
- Not stored by the backend, so empty in server mode (never mocked): balance ledger, comp-off, delegations, holidays, accrual run history, settings history. Notices use `components/shared/LeaveServerNotice.tsx`.
- Personal features need the caller's employee id from auth (`user.employeeId`). When it is missing, My Leave, personal / team calendars, manager approvals and multi-level workflow approvals (`/leave-approval/*`) show `LeaveEmployeeLinkNotice`.

## Folder structure

- `pages/` — `LeavePage` with role-filtered tabs and demo view switcher
- `constants/userRoles.ts`, `constants/employmentStatuses.ts` — mirror Prisma enums in the UI
- `components/myLeave/` — Balances, request table, apply sheet, detail timeline
- `components/approvals/` — Manager/HR approval queues
- `components/calendar/` — Month grid and mobile agenda
- `components/balances/` — HR balance table and ledger sheet
- `components/accruals/` — Monthly accrual and year-end preview
- `components/settings/` — Two-pane settings tab, section panels, and sticky save bar
- `constants/` — Status pills, type codes, compliance copy
- `types/` — Requests, ledger, comp-off, encashment, settings models
- `utils/` — Day counting, validation, accrual, approval chain pure functions
- `api/` — RTK Query endpoints, backend contract types, mappers
- `services/` — Mock store, facade, server snapshot builder, payroll read API
- `hooks/` — Page tabs, settings form, provider state

## Where to change things

- Shared UI tokens (tabs, filters, tables, sheets) → `components/shared/leaveUi.ts`, `leaveTableLayout.ts`
- Stat cards (labels, icon tiles, tones) → `components/LeaveStatGrid.tsx`
- Status and type chips → `constants/leaveStatuses.ts`, `constants/leaveTypeChips.ts`, `LeaveStatusPill.tsx`, `LeaveTypeChip.tsx`
- Table filters and row actions → `components/shared/LeaveTableFilters.tsx`, `LeaveRowActions.tsx`
- Approval sub-tabs segmented control → `components/shared/LeaveSegmentedControl.tsx`
- Shared dialog shell and apply form → `components/shared/LeaveDialog.tsx`, `components/applyLeave/ApplyLeaveDialog.tsx`
- Toasts and confirm dialogs → `LeaveToastProvider.tsx`, `LeaveConfirmDialog.tsx`
- Leave Settings sections → `components/settings/LeaveSettingsTab.tsx`, `components/settings/sections/*`, `constants/leaveSettingsSections.ts`
- Earning models (settings editor) → `types/leaveEarningModel.ts`, `utils/leaveEarningModel.ts`, `constants/earningModelCards.ts`
- Employee-facing policy preview → `utils/buildEmployeeLeavePreview.ts`
- Table “How it works” sentence → `utils/buildLeaveHowItWorksSentence.ts`
- Settings save history → `types/settingsHistory.ts`, `utils/buildSettingsHistoryEntries.ts`, `services/leaveService.ts`
- Leave rules seeds → `services/companyDefaults.ts` (sample values, confirm with CA); type seeds in `services/defaultLeaveTypes.ts`
- Connect payroll → `services/leavePayrollApi.ts`
- Viewer identity → `context/LeaveViewerProvider.tsx` + `utils/resolveLeaveViewer.ts`: signed-in users come from Redux `auth.user` (role from the active workspace, `employeeId` when auth exposes it); `constants/leaveDemoViewers.ts` personas apply only when nobody is signed in
- Accounts without `employeeId` on auth → `components/shared/LeaveEmployeeLinkNotice.tsx` ("We couldn't retrieve your employee record…", never "not linked") replaces personal data (My Leave, team approvals, personal calendar)
- HR Admin Overview → `components/overview/HrOverviewTab.tsx` and section cards under `components/overview/`
  - Section chrome → `OverviewSectionHeader.tsx`, shared card shell `OverviewCard.tsx`
  - Attention section → `OverviewAttentionSection.tsx`, banner `OverviewAttentionBanner.tsx`, also-list `OverviewAttentionAlso.tsx` (request queue lives on Requests tab only)
  - Attention data → `utils/buildAttentionSummary.ts`, HR queue rules `utils/attentionHrQueue.ts`, low-balance threshold `constants/hrOverviewConstants.ts`
  - Stat subtitles → `utils/overviewStatSubtitles.ts`
  - Date range copy → `utils/formatDateRange.ts`, today label `utils/formatOverviewToday.ts`
  - Chart range → `utils/overviewRange.ts`, ticks/legend tokens `utils/overviewChartTheme.ts`, tooltip `OverviewTrendTooltip.tsx`
  - Leave trend (stacked bar) → `OverviewLeaveTrendChart.tsx`, data in `utils/overviewLeaveTrend.ts`
  - Leave by type (donut) → `OverviewLeaveTypeDonut.tsx`, data in `utils/overviewLeaveByType.ts`
  - 14-day outlook → `OverviewOutlook14Strip.tsx`, cells `OverviewOutlookDayCell.tsx`, data in `utils/overviewOutlook14.ts`
  - Department availability → `OverviewDeptAvailability.tsx`, data in `utils/overviewDeptAvailability.ts`
  - Who's away → `OverviewWhosAway.tsx`, data in `utils/overviewWhosAway.ts`
  - Recent activity → `OverviewRecentActivity.tsx`, data in `utils/buildRecentActivity.ts`, time in `utils/formatRelativeTime.ts`
  - Shared approved-leave filter → `utils/overviewApprovedLeave.ts`
  - Quick actions → `OverviewHeaderActions.tsx`, accrual confirm `OverviewRunAccrualDialog.tsx`
- HR Reports and CSV export → `components/reports/`, `utils/downloadCsv.ts`, `utils/reportBalanceSummary.ts`
- Employee panel (My Leave + Calendar): self-scoped calendar, `MyLeaveEmployeeOverview`, policy-gated comp-off/encashment (`utils/buildCalendarLeaveByDay.ts`, `employeeLeavePolicy.ts`)
- Manager panel: team calendar scope (`team` in `buildCalendarLeaveByDay.ts`), `MyLeaveManagerOverview`, Approvals with encashment/comp-off tables (`managerApprovalsQueue.ts`, `useManagerApprovalsTab.ts`)
- Super Admin: HR tabs plus **Audit** (`/leave/audit`) and **Access** (`/leave/access`); overview banner, demo reset, `superAdminAuditInsights.ts` under `components/superAdmin/`
- Mock employees and requests → `services/mockEmployees.ts`, `mockRequests.ts`
- Calculations → `utils/countLeaveDays.ts`, `validateLeaveRequest.ts`
