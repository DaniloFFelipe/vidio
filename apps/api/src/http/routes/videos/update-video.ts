import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/database'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'

export async function updateVideoByUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/organizations/:slug/video/:videoId',
      {
        schema: {
          tags: ['Video'],
          summary: 'Updates a Video',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().optional(),
            thumbnailUrl: z.string().url().optional(),
          }),
          params: z.object({
            slug: z.string(),
            videoId: z.string().uuid(),
          }),
          response: {
            201: z.object({
              videoId: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, videoId } = request.params
        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(
          userId,
          membership.role,
          organization.id,
        )

        if (cannot('update', 'Video')) {
          throw new UnauthorizedError(
            `You're not allowed to create new invites.`,
          )
        }

        const { name, thumbnailUrl } = request.body

        const video = await prisma.videos.findUnique({
          where: {
            id: videoId,
          },
        })

        if (!video) {
          throw new BadRequestError('Video was not found')
        }

        await prisma.videos.update({
          where: {
            id: video.id,
          },
          data: {
            name,
            thumbnailUrl,
          },
        })

        return reply.status(201).send({
          videoId: video.id,
        })
      },
    )
}
