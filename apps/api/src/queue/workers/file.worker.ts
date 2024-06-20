import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

import { File } from '@prisma/client'

import { prisma } from '@/lib/database'
import { Transcoder } from '@/lib/hls'
import { resolvePath } from '@/utils/resolve-path'

export const FileWorkers: Record<string, (file: File) => Promise<void>> = {
  process: async (file) => {
    try {
      const outputPath = resolve(
        process.cwd(),
        'uploads',
        'stream',
        file.name.split('.')[0],
      )
      const inputPath = resolvePath(file.rawLocation)
      console.log(inputPath, process.cwd(), 'INPUT FILE')

      await mkdir(outputPath)
      const transcoder = new Transcoder(inputPath, outputPath, {})
      await transcoder.transcode()

      const outputLocation = `/uploads/stream/${file.name.split('.')[0]}/index.m3u8`

      await prisma.file.update({
        where: {
          id: file.id,
        },
        data: {
          status: 'DONE',
          location: outputLocation,
        },
      })
    } catch (error) {
      console.log(error)

      await prisma.file.update({
        where: {
          id: file.id,
        },
        data: {
          status: 'FAILLURE',
        },
      })
    }
  },
}
