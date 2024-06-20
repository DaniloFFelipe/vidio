import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/database'
import { getBaseUrlFromRequest } from '@/utils/get-base-url-from-request'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getOrganizationVideo(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/videos/:videoId',
      {
        schema: {
          tags: ['Videos'],
          summary: 'Get all organization Videos',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            videoId: z.string(),
          }),
          response: {
            200: z.object({
              video: z.object({
                url: z.string(),
                name: z.string(),
                id: z.string(),
                thumbnailUrl: z.string(),
                createdAt: z.date(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, videoId } = request.params
        const { organization } = await request.getUserMembership(slug)

        const video = await prisma.videos.findUnique({
          select: {
            id: true,
            createdAt: true,
            file: true,
            name: true,
            thumbnailUrl: true,
          },
          where: {
            organizationId: organization.id,
            id: videoId,
          },
        })

        if (!video) {
          throw new BadRequestError('Video was not found')
        }

        return reply.send({
          video: {
            id: video.id,
            name: video.name,
            thumbnailUrl: video.thumbnailUrl,
            url: new URL(
              `/stream/${video.file.id}`,
              getBaseUrlFromRequest(request),
            ).toString(),
            createdAt: video.createdAt,
          },
        })
      },
    )
}
