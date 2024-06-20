import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'
import { prisma } from '@/lib/database'

export const appKey = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getApplication = async () => {
      try {
        const apiKey = request.headers['x-api-key'] as string
        if (!apiKey) {
          throw new UnauthorizedError('Invalid api key')
        }

        const { organization } = await prisma.applicationKey.findUniqueOrThrow({
          where: {
            keyHash: await hash(apiKey, 8),
          },
          include: {
            organization: true,
          },
        })
        return { organization }
      } catch {
        throw new UnauthorizedError('Invalid api key')
      }
    }
  })
})
