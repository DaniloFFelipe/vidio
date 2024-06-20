import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/database'
import { fileQueue } from '@/queue'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

const pump = promisify(pipeline)

export async function uploadFile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/files/upload',
      {
        schema: {
          tags: ['File'],
          summary: 'Remove a file from the organization',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.object({
              fileId: z.string(),
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
        await fileQueue.add('process', file)

        return reply.status(201).send({
          fileId: file.id,
        })
      },
    )
}
