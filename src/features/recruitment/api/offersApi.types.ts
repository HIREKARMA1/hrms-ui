/** Offer types for `/recruitment/offers`. */

export type OfferStatus = 'RELEASED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export const OFFER_STATUSES: OfferStatus[] = [
  'RELEASED',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]

export type BackendOffer = {
  id: string
  applicationId: string | null
  candidateId: string | null
  jobPostingId: string | null
  candidateName: string | null
  jobTitle: string | null
  offeredDesignation: string | null
  department: string | null
  salary: number | null
  salaryCurrency: string | null
  joiningDate: string | null
  expiryDate: string | null
  employmentType: string | null
  status: OfferStatus
  reason: string | null
  offerLetterFileName: string | null
  offerLetterUrl: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type OffersPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type OffersPage = {
  items: BackendOffer[]
  pagination: OffersPagination
}

export type ListOffersArgs = {
  page?: number
  limit?: number
  search?: string
  status?: OfferStatus
  candidateId?: string
  jobPostingId?: string
}

export type CreateOfferBody = {
  applicationId?: string
  candidateId?: string
  jobPostingId?: string
  offeredDesignation?: string
  department?: string
  salary?: number
  salaryCurrency?: string
  joiningDate?: string
  expiryDate?: string
  employmentType?: string
}

export type UpdateOfferStatusBody = {
  status: OfferStatus
  reason?: string
}