import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/database'
import { getBaseUrlFromRequest } from '@/utils/get-base-url-from-request'

export async function getOrganizationVideos(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/videos',
      {
        schema: {
          tags: ['Videos'],
          summary: 'Get all organization Videos',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          querystring: z.object({
            pageIndex: z.coerce.number().default(0),
            perPage: z.coerce.number().default(20),
          }),
          response: {
            200: z.object({
              meta: z.object({
                total: z.number(),
                nextPageIndex: z.number().nullable(),
              }),
              videos: z.array(
                z.object({
                  url: z.string(),
                  name: z.string(),
                  id: z.string(),
                  thumbnailUrl: z.string(),
                  createdAt: z.date(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { pageIndex, perPage } = request.query
        const { organization } = await request.getUserMembership(slug)

        const [videos, total] = await Promise.all([
          prisma.videos.findMany({
            select: {
              id: true,
              createdAt: true,
              file: true,
              name: true,
              thumbnailUrl: true,
            },
            where: {
              organizationId: organization.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
            skip: pageIndex * perPage,
            take: perPage,
          }),
          prisma.videos.count({
            where: {
              organizationId: organization.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
          }),
        ])

        const videosWithUrl = videos.map((v) => ({
          ...v,
          url: new URL(
            `/stream/${v.file.id}`,
            getBaseUrlFromRequest(request),
          ).toString(),
          file: undefined,
        }))

        const hasNext = total / perPage > pageIndex + 1
        return reply.send({
          videos: videosWithUrl,
          meta: {
            total,
            nextPageIndex: hasNext ? pageIndex + 1 : null,
          },
        })
      },
    )
}
