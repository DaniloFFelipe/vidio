import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { uploadToStorage } from '@/utils/upload-to-storage'

import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'

export async function uploadImages(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/images/upload',
      {
        schema: {
          tags: ['Images'],
          summary: '',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              fileUrl: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const upload = await request.file()

        if (!upload) {
          throw new BadRequestError('No media provided')
        }

        const mimeTypeRegex = /^(image)\/[a-zA-Z]+/
        const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

        if (!isValidFileFormat) {
          throw new BadRequestError('Invalid format')
        }

        const { fileUrl } = await uploadToStorage(upload, request)
        return reply.status(200).send({ fileUrl })
      },
    )
}
