/* eslint-disable no-new */
import { Callbacks, File } from '@prisma/client'
import { Queue, Worker } from 'bullmq'

import { redis } from '@/lib/redis'

import { callbackWorkers, fileWorkers } from './workers'

export const fileQueue = new Queue<File>('file', {
  connection: redis,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const callbackQueue = new Queue<Callbacks & { payload: any }>(
  'callbacks',
  {
    connection: redis,
  },
)

new Worker('file', fileWorkers, {
  connection: redis,
})

new Worker('callbacks', callbackWorkers, {
  connection: redis,
})
