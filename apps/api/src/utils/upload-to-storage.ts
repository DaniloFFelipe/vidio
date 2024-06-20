import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

import { MultipartFile } from '@fastify/multipart'
import { FastifyRequest } from 'fastify'

const pump = promisify(pipeline)

export async function uploadToStorage(
  file: MultipartFile,
  request: FastifyRequest,
) {
  const fileId = randomUUID()
  const extension = extname(file.filename)
  const fileName = fileId.concat(extension)

  const writeStream = createWriteStream(
    resolve(process.cwd(), 'uploads', 'raw', fileName),
  )

  await pump(file.file, writeStream)

  const fullUrl = request.protocol.concat('://').concat(request.hostname)
  const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

  return { fileUrl }
}
