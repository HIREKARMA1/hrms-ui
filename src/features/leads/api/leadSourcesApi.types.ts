/**
 * Lead Sources API contracts (`/lead-sources`).
 * Aligned with hrms-server `createLeadSourceSchema` / `listTaxonomySchema`
 * and `toSourceResponse`.
 */

export type BackendLeadSource = {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type LeadSourcesPage = {
  items: BackendLeadSource[]
}

export type ListLeadSourcesArgs = {
  isActive?: boolean
}

/** POST /lead-sources */
export type CreateLeadSourceBody = {
  code: string
  name: string
  description?: string
  isActive?: boolean
}
