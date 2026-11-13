# Leave Management (UI)

Single-company leave: balances, requests, approvals, calendar, accruals, and policy settings. Mock data lives behind `services/leaveService.ts`.

## Folder structure

- `pages/` — `LeavePage` with role-filtered tabs and demo view switcher
- `components/myLeave/` — Balances, request table, apply sheet, detail timeline
- `components/approvals/` — Manager/HR approval queues
- `components/calendar/` — Month grid and mobile agenda
- `components/balances/` — HR balance table and ledger sheet
- `components/accruals/` — Monthly accrual and year-end preview
- `components/settings/` — Policy cards and sticky save bar
- `constants/` — Status pills, type codes, compliance copy
- `types/` — Requests, ledger, comp-off, encashment, settings models
- `utils/` — Day counting, validation, accrual, approval chain pure functions
- `services/` — Mock store, facade, payroll read API
- `hooks/` — Viewer demo role, page tabs, settings form, provider state

## Where to change things

- Leave rules seeds → `services/companyDefaults.ts` or **Leave Settings**
- Connect payroll → `services/leavePayrollApi.ts`
- Connect real login → `hooks/useLeaveViewer.ts`
- Mock employees and requests → `services/mockEmployees.ts`, `mockRequests.ts`
- Calculations → `utils/countLeaveDays.ts`, `validateLeaveRequest.ts`
