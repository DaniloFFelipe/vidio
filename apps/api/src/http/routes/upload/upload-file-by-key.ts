import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { appKey } from '@/http/middlewares/appkey'
import { prisma } from '@/lib/database'

import { BadRequestError } from '../_errors/bad-request-error'

const pump = promisify(pipeline)

export async function uploadFileBYKey(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(appKey)
    .post(
      '/api/files/upload',
      {
        schema: {
          tags: ['File'],
          summary: 'Remove a file from the organization',
          security: [{ bearerAuth: [] }],
          response: {
            204: z.object({
              fileId: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { organization } = await request.getApplication()
        const upload = await request.file()

        if (!upload) {
          throw new BadRequestError('No media provided')
        }

        const mimeTypeRegex = /^(video)\/[a-zA-Z]+/
        const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

        if (!isValidFileFormat) {
          throw new BadRequestError('Invalid format')
        }

        const fileId = randomUUID()
        const extension = extname(upload.filename)

        const fileName = fileId.concat(extension)

        const writeStream = createWriteStream(
          resolve(process.cwd(), 'uploads', 'raw', fileName),
        )

        await pump(upload.file, writeStream)

        const file = await prisma.file.create({
          data: {
            rawLocation: `/uploads/raw/${fileName}`,
            organizationId: organization.id,
            name: fileName,
          },
        })
        await request.fileQueue.add('process', file)

        return reply.status(201).send({
          fileId: file.id,
        })
      },
    )
}
