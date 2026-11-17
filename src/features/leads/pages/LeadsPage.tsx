/**
 * Leads Management — Admin, Super Admin, HR (Manager), and Employee panels.
 */

import { useMemo, useState } from 'react'

import {
  isHrAdminExperience,
  isManagerExperience,
  isSuperAdminExperience,
  type UserRole,
} from '@/features/leave/constants/userRoles'
import { useRbacSession } from '@/features/rbac/hooks/useRbacSession'

import { LeadsDuplicatesTab } from '../components/duplicates/LeadsDuplicatesTab'
import { LeadDetailDialog } from '../components/LeadDetailDialog'
import { LeadFormDialog } from '../components/LeadFormDialog'
import { AllLeadsTab } from '../components/list/AllLeadsTab'
import { ScopedLeadsListTab } from '../components/list/ScopedLeadsListTab'
import { LeadsOverviewTab } from '../components/overview/LeadsOverviewTab'
import { LeadsPageHeader } from '../components/LeadsPageHeader'
import { LeadsPipelineTab } from '../components/pipeline/LeadsPipelineTab'
import { DEMO_ACTOR_BY_ROLE } from '../constants/leadsDemoActor'
import { LeadsProvider } from '../context/LeadsProvider'
import { useLeads } from '../hooks/useLeads'
import { useLeadsRoute } from '../hooks/useLeadsRoute'
import { useLeadsScope } from '../hooks/useLeadsScope'
import type { Lead } from '../types/lead'
import { visibleLeadsForRole } from '../utils/visibleLeadsForRole'

function LeadsPagePanels() {
  const session = useRbacSession()
  const role = (session.roleCode ?? 'HR_ADMIN') as UserRole
  const { activeTab, goToTab } = useLeadsRoute(role)
  const { loading, error, reload, leads, selectedLeadId, setSelectedLeadId, deleteLead } = useLeads()
  const {
    canEditLead,
    canDeleteLeads,
    canCreateLeads,
  } = useLeadsScope(role, 'org')
  const [formState, setFormState] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    lead: Lead | null
  }>({ open: false, mode: 'create', lead: null })

  const actorId = DEMO_ACTOR_BY_ROLE[role]
  const visibleLeads = useMemo(() => visibleLeadsForRole(leads, role), [leads, role])

  const selectedLead = visibleLeads.find((item) => item.id === selectedLeadId) ?? null

  if (loading) {
    return <p className="text-sm text-hrms-text-muted">Loading leads…</p>
  }
  if (error) {
    return (
      <div className="rounded-xl border border-hrms-danger/30 bg-red-50 p-4 text-sm text-hrms-danger">
        {error}{' '}
        <button type="button" className="underline" onClick={reload}>
          Retry
        </button>
      </div>
    )
  }

  function openEdit(lead: Lead) {
    setFormState({ open: true, mode: 'edit', lead })
  }

  async function handleDelete() {
    if (!selectedLead || !canDeleteLeads) return
    if (!window.confirm(`Delete lead ${selectedLead.id}?`)) return
    await deleteLead(selectedLead.id)
    setSelectedLeadId(null)
  }

  const showAdminPanels = isHrAdminExperience(role) || isSuperAdminExperience(role)
  const showManagerPanels = isManagerExperience(role)

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <header className="border-b border-hrms-border pb-3 pt-1">
        <LeadsPageHeader activeSection={activeTab} />
      </header>
      <section
        aria-label={activeTab}
        className={
          activeTab === 'Overview'
            ? 'min-h-0 w-full -mx-2 rounded-none bg-transparent px-2 sm:-mx-0 sm:px-0'
            : 'min-h-0 w-full rounded-xl bg-transparent'
        }
      >
        {activeTab === 'Overview' && (showAdminPanels || showManagerPanels) ? (
          <LeadsOverviewTab
            role={role}
            onNavigate={goToTab}
            onOpenCreate={
              canCreateLeads
                ? () => setFormState({ open: true, mode: 'create', lead: null })
                : undefined
            }
            onOpenLead={setSelectedLeadId}
          />
        ) : null}
        {activeTab === 'All Leads' && showAdminPanels ? (
          <AllLeadsTab
            onOpenCreate={() => setFormState({ open: true, mode: 'create', lead: null })}
            onOpenEdit={openEdit}
            canEditLead={canEditLead}
            canDeleteLeads={canDeleteLeads}
          />
        ) : null}
        {activeTab === 'My Leads' ? (
          <ScopedLeadsListTab
            role={role}
            scope="my"
            title="Leads assigned to you"
            onOpenCreate={
              canCreateLeads
                ? () => setFormState({ open: true, mode: 'create', lead: null })
                : undefined
            }
            onOpenEdit={openEdit}
          />
        ) : null}
        {activeTab === 'Team Leads' && showManagerPanels ? (
          <ScopedLeadsListTab
            role={role}
            scope="team"
            title="Team pipeline (assigned sales owners)"
            onOpenCreate={() => setFormState({ open: true, mode: 'create', lead: null })}
            onOpenEdit={openEdit}
          />
        ) : null}
        {activeTab === 'Pipeline' && (showAdminPanels || showManagerPanels) ? (
          <LeadsPipelineTab role={role} onOpenEdit={openEdit} />
        ) : null}
        {activeTab === 'Duplicates' && showAdminPanels ? <LeadsDuplicatesTab /> : null}
      </section>
      {canCreateLeads ? (
        <LeadFormDialog
          open={formState.open}
          onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
          mode={formState.mode}
          initial={formState.lead}
          defaultAssigneeId={isManagerExperience(role) ? actorId : undefined}
          onSaved={(saved) => setSelectedLeadId(saved.id)}
        />
      ) : null}
      <LeadDetailDialog
        lead={selectedLead}
        open={Boolean(selectedLead)}
        onOpenChange={(open) => {
          if (!open) setSelectedLeadId(null)
        }}
        onEdit={() => selectedLead && openEdit(selectedLead)}
        onDelete={() => void handleDelete()}
        canEdit={canEditLead}
        canDelete={canDeleteLeads}
      />
    </div>
  )
}

export function LeadsPage() {
  return (
    <LeadsProvider>
      <LeadsPagePanels />
    </LeadsProvider>
  )
}

export default LeadsPage