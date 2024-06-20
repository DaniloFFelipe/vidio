/* eslint-disable @typescript-eslint/no-explicit-any */
import 'fastify'

import type { Callbacks, File, Member, Organization } from '@prisma/client'
import { Queue } from 'bullmq'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(
      slug: string,
    ): Promise<{ organization: Organization; membership: Member }>
    getApplication(): Promise<{ organization: Organization }>
    fileQueue: Queue<File>
    callbackQueue: Queue<Callbacks & { payload: any }>
  }
}
