/**

 * Composes payroll tabs: Overview, Structures, Variable Pay, Settlement, Settings.

 * Routed from App.tsx at /payroll inside MainLayout.

 */



import { PageHeader } from '../components/PageHeader'

import { PayrollErrorState } from '../components/PayrollErrorState'

import { PayrollPageTabs } from '../components/PayrollPageTabs'

import { PayrollSkeleton } from '../components/PayrollSkeleton'

import { PayrollOverviewTab } from '../components/overview/PayrollOverviewTab'

import { PayrollSettingsTab } from '../components/settings/PayrollSettingsTab'

import { FinalSettlementTab } from '../components/settlement/FinalSettlementTab'

import { RunPayrollDialog } from '../components/RunPayrollDialog'

import { SalaryStructuresTab } from '../components/structures/SalaryStructuresTab'

import { VariablePayTab } from '../components/variablePay/VariablePayTab'

import { PayrollPageChrome } from '../components/shared/PayrollPageChrome'

import { PayrollToastProvider } from '../components/PayrollToastProvider'

import { PayrollProvider } from '../context/PayrollProvider'

import { usePayrollPageTabs } from '../hooks/usePayrollPageTabs'

import { usePayroll } from '../hooks/usePayroll'



function PayrollPagePanels() {

  const { loading, error, reload } = usePayroll()

  const { activeTab, setActiveTab, onKeyDown } = usePayrollPageTabs()



  if (loading) {

    return <PayrollSkeleton />

  }



  if (error) {

    return <PayrollErrorState message={error} onRetry={reload} />

  }



  return (

    <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 overflow-visible">

      <PayrollPageChrome

        header={<PageHeader />}

        tabs={

          <PayrollPageTabs

            activeTab={activeTab}

            onTabChange={setActiveTab}

            onKeyDown={onKeyDown}

          />

        }

      />

      <section

        role="tabpanel"

        className="min-h-0 w-full overflow-visible"

        id={`payroll-page-panel-${activeTab}`}

        aria-labelledby={`payroll-page-tab-${activeTab}`}

      >

        {activeTab === 'Overview' ? <PayrollOverviewTab /> : null}

        {activeTab === 'Salary Structures' ? <SalaryStructuresTab /> : null}

        {activeTab === 'Variable Pay' ? <VariablePayTab /> : null}

        {activeTab === 'Final Settlement' ? <FinalSettlementTab /> : null}

        {activeTab === 'Payroll Settings' ? <PayrollSettingsTab /> : null}

      </section>

      <RunPayrollDialog />

    </div>

  )

}



export function PayrollPage() {

  return (

    <PayrollToastProvider>

      <PayrollProvider>

        <PayrollPagePanels />

      </PayrollProvider>

    </PayrollToastProvider>

  )

}



export default PayrollPage

