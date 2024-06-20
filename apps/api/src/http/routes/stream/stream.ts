import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/database'
import { getBaseUrlFromRequest } from '@/utils/get-base-url-from-request'

import { BadRequestError } from '../_errors/bad-request-error'

export async function streamMedia(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/stream/:id',
      {
        schema: {
          params: z.object({
            id: z.string().uuid(),
          }),
        },
      },
      async (request, reply) => {
        // await request.getCurrentUserId()

        const { id } = request.params
        const media = await prisma.file.findUnique({
          where: {
            id,
          },
        })

        if (!media) {
          throw new BadRequestError('Media not found')
        }

        if (!media.location) {
          throw new BadRequestError('Media is not ready to stream')
        }

        const fullUrl = getBaseUrlFromRequest(request)
        const fileUrl = new URL(
          `${media.location.replace('uploads', 'files')}`,
          fullUrl,
        ).toString()
        return reply.redirect(fileUrl)
      },
    )
}
