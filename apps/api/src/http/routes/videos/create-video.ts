import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/database'
import { callbackQueue } from '@/queue'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'

export async function createVideoByUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/video',
      {
        schema: {
          tags: ['Video'],
          summary: 'Create a new Video',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            thumbnailUrl: z.string().url(),
            fileId: z.string().uuid(),
            metadata: z.any().optional(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              videoId: z.string(),
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

        if (cannot('create', 'Video')) {
          throw new UnauthorizedError(
            `You're not allowed to create new invites.`,
          )
        }

        const { name, fileId, thumbnailUrl, metadata } = request.body

        if (metadata && typeof metadata !== 'object') {
          throw new BadRequestError('Invalid Metadata')
        }

        const video = await prisma.videos.create({
          data: {
            name,
            fileId,
            thumbnailUrl,
            organizationId: organization.id,
            metadata,
          },
        })

        const callback = await prisma.callbacks.findUnique({
          where: {
            type_organizationId: {
              type: 'VIDEO_CREATED',
              organizationId: organization.id,
            },
          },
        })

        if (callback) {
          await callbackQueue.add('sendCallback', {
            ...callback,
            payload: video,
          })
        }

        return reply.status(201).send({
          videoId: video.id,
        })
      },
    )
}
