import { z } from 'zod'

const addressSchema = z.object({
  line1: z.string().trim().min(1, 'Address line 1 is required'),
  line2: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pincode: z.string().trim().min(1, 'Pincode is required'),
  country: z.string().trim().min(1).default('India'),
})

const bankSchema = z.object({
  accountHolderName: z.string().trim().min(1, 'Account holder name is required'),
  accountNumber: z.string().trim().min(1, 'Account number is required'),
  ifsc: z
    .string()
    .trim()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, 'Invalid IFSC format')
    .transform((v) => v.toUpperCase()),
  bankName: z.string().trim().min(1, 'Bank name is required'),
  branch: z.string().trim().optional().or(z.literal('')),
})

export const organisationOnboardingFormSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  professionalIdentity: z
    .string()
    .trim()
    .min(1, 'Professional identity is required'),
  phone: z.string().trim().min(8, 'Phone number is required'),
  aadhaar: z
    .string()
    .trim()
    .regex(/^\d{12}$/, 'Aadhaar must be 12 digits'),
  pan: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/i, 'Invalid PAN format')
    .transform((v) => v.toUpperCase()),
  bloodGroup: z.string().trim().min(1, 'Blood group is required'),
  photoUrl: z.string().trim().url('Photo upload is required'),
  uanNumber: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().trim().min(1).optional(),
  ),
  salarySlipUrls: z
    .array(z.string().trim().url('Each salary slip must be a valid URL'))
    .max(20)
    .optional()
    .default([]),
  relievingLetterUrl: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().trim().url('Relieving letter must be a valid URL').optional(),
  ),
  sameAsPermanent: z.boolean().optional(),
  permanentAddress: addressSchema,
  currentAddress: addressSchema.optional(),
  bankDetail: bankSchema,
})

export type OrganisationOnboardingFormValues = z.infer<
  typeof organisationOnboardingFormSchema
>
