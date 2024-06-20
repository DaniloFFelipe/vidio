import { randomUUID } from 'node:crypto'

import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/database'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function createApplicationKey(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/keys',
      {
        schema: {
          tags: ['Key'],
          summary: 'Create a new key',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              key: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(
          userId,
          membership.role,
          organization.id,
        )

        if (cannot('create', 'Key')) {
          throw new UnauthorizedError(
            `You're not allowed to create new invites.`,
          )
        }

        const { name } = request.body
        const key = randomUUID()
        const keyHash = await hash(key, 8)

        await prisma.applicationKey.create({
          data: {
            organizationId: organization.id,
            keyHash,
            name,
          },
        })

        return reply.status(201).send({
          key,
        })
      },
    )
}
