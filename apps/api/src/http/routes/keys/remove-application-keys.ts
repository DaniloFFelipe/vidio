import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/database'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function removeApplicationKeys(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug/keys/:keyId',
      {
        schema: {
          tags: ['Key'],
          summary: 'Remove a key from the organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            keyId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, keyId } = request.params
        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(
          userId,
          membership.role,
          organization.id,
        )

        if (cannot('delete', 'Key')) {
          throw new UnauthorizedError(
            `You're not allowed to remove this member from organization.`,
          )
        }

        await prisma.applicationKey.delete({
          where: {
            id: keyId,
            organizationId: organization.id,
          },
        })

        return reply.status(204).send()
      },
    )
}
