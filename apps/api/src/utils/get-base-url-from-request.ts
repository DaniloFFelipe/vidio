import type { FastifyRequest } from 'fastify'

export function getBaseUrlFromRequest(request: FastifyRequest) {
  return request.protocol.concat('://').concat(request.hostname)
}
