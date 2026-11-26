/**
 * Lead Categories API contracts (`/lead-categories`).
 * Aligned with hrms-server `createLeadCategorySchema` / `listTaxonomySchema`
 * and `toCategoryResponse`.
 */

export type BackendLeadCategory = {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type LeadCategoriesPage = {
  items: BackendLeadCategory[]
}

export type ListLeadCategoriesArgs = {
  isActive?: boolean
}

/** POST /lead-categories */
export type CreateLeadCategoryBody = {
  code: string
  name: string
  description?: string
  isActive?: boolean
}
