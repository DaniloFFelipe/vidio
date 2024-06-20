import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/database'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function registerCallback(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/callbacks',
      {
        schema: {
          tags: ['Callbacks'],
          summary: 'Create a new callback',
          security: [{ bearerAuth: [] }],
          body: z.object({
            url: z.string().url(),
            type: z.enum(['VIDEO_CREATED', 'VIDEO_DELETED']),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.object({}),
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

        if (cannot('update', 'Organization')) {
          throw new UnauthorizedError(
            `You're not allowed to create new invites.`,
          )
        }

        const { type, url } = request.body

        const callback = await prisma.callbacks.findUnique({
          where: {
            type_organizationId: {
              organizationId: organization.id,
              type,
            },
          },
        })

        if (!callback) {
          await prisma.callbacks.create({
            data: {
              organizationId: organization.id,
              type,
              url,
            },
          })
        } else {
          await prisma.callbacks.update({
            where: {
              id: callback.id,
            },
            data: {
              url,
            },
          })
        }

        return reply.status(204).send({})
      },
    )
}
