/**

 * Top guidance on Payroll Settings — company policy vs per-employee pay.

 */



import type { PayrollPageTabId } from '../../hooks/usePayrollPageTabs'

import { CA_COMPLIANCE_NOTICE } from '../../constants/payrollRules'

import { PAYROLL_SETTINGS_INTRO_LINKS } from '../../constants/payrollSettingsRelatedTabs'

import { PayrollSettingsModuleLink } from './PayrollSettingsModuleLink'



type PayrollSettingsIntroCardProps = {

  onNavigateTab: (tab: PayrollPageTabId) => void

}



export function PayrollSettingsIntroCard({ onNavigateTab }: PayrollSettingsIntroCardProps) {

  return (

    <div className="rounded-xl border border-hrms-border bg-white p-4 shadow-sm sm:p-5">

      <h2 className="text-base font-semibold text-hrms-navy">Company payroll policy</h2>

      <p className="mt-2 text-sm leading-relaxed text-hrms-text-secondary">

        Settings here define how payroll is calculated for the whole organization. They do not set individual salaries.

        Assign pay amounts per employee on <span className="font-medium text-hrms-navy">Salary Structures</span>.

        Enter monthly overtime, bonuses, and incentives on <span className="font-medium text-hrms-navy">Variable Pay</span>.

      </p>

      <div className="mt-4 flex flex-wrap gap-2">

        {PAYROLL_SETTINGS_INTRO_LINKS.map((item) => (

          <PayrollSettingsModuleLink

            key={item.tab}

            tab={item.tab}

            label={item.label}

            onNavigate={onNavigateTab}

          />

        ))}

      </div>

      <p className="mt-4 text-sm text-hrms-text-muted">{CA_COMPLIANCE_NOTICE}</p>

      <p className="mt-2 text-xs text-hrms-text-muted">

        Saved in this demo workspace until the payroll API is connected.

      </p>

    </div>

  )

}
