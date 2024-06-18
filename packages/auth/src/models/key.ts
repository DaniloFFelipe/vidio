import { z } from 'zod'

export const keySchema = z.object({
  __typename: z.literal('Key').default('Key'),
  id: z.string(),
  organizationId: z.string(),
})

export type Key = z.infer<typeof keySchema>
