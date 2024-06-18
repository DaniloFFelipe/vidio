import { z } from 'zod'

export const videoSchema = z.object({
  __typename: z.literal('Video').default('Video'),
  id: z.string(),
  organizationId: z.string(),
})

export type Video = z.infer<typeof videoSchema>
