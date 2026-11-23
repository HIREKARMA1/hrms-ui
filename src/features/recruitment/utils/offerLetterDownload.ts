import type { Offer } from '../types/recruitment'

export function buildDemoOfferLetterBlob(offer: Offer): Blob {
  const body = [
    'OFFER OF EMPLOYMENT (Demo)',
    '',
    `Dear ${offer.candidateName},`,
    '',
    `We are pleased to offer you the position of ${offer.offeredDesignation}`,
    `(${offer.jobTitle}) in the ${offer.department} department.`,
    '',
    `Compensation: ${offer.offeredSalary}`,
    `Employment type: ${offer.employmentType}`,
    `Proposed joining date: ${offer.joiningDate || '—'}`,
    `Offer valid until: ${offer.offerExpiryDate || '—'}`,
    '',
    'This document is generated locally for demo download only.',
    'When the recruitment API is connected, the real offer letter file will be served.',
  ].join('\n')

  return new Blob([body], { type: 'text/plain;charset=utf-8' })
}

export function triggerOfferLetterDownload(offer: Offer, blob: Blob) {
  if (!offer.offerLetterFileName) return
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = offer.offerLetterFileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}