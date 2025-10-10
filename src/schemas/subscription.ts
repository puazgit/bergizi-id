// Subscription Validation Schemas
// Cross-domain subscription management validation schemas
// src/schemas/subscription.ts

import { z } from 'zod'

export const subscriptionSchema = z.object({
  plan: z.enum(['TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  maxBeneficiaries: z.number().min(1),
})

export type SubscriptionInput = z.infer<typeof subscriptionSchema>