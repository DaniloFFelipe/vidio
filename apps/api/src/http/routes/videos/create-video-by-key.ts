import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { appKey } from '@/http/middlewares/appkey'
import { prisma } from '@/lib/database'
import { callbackQueue } from '@/queue'

import { BadRequestError } from '../_errors/bad-request-error'

export async function createVideoByKey(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(appKey)
    .post(
      '/api/organizations/video',
      {
        schema: {
          tags: ['Video'],
          summary: 'Create a new Video',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            thumbnailUrl: z.string().url(),
            fileId: z.string().uuid(),
            metadata: z.any(),
          }),
          response: {
            201: z.object({
              videoId: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { organization } = await request.getApplication()

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
