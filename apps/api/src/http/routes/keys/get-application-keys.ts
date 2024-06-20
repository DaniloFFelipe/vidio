import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/database'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function getApplicationKeys(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/keys',
      {
        schema: {
          tags: ['Key'],
          summary: 'Get all organization keys',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              keys: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                }),
              ),
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

        if (cannot('get', 'Key')) {
          throw new UnauthorizedError(
            `You're not allowed to see organization members.`,
          )
        }

        const keys = await prisma.applicationKey.findMany({
          select: {
            id: true,
            name: true,
          },
          where: {
            organizationId: organization.id,
          },
        })

        return reply.send({ keys })
      },
    )
}
