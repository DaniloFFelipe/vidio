import { Job } from 'bullmq'

import { CallbacksWorkers } from './callbacks.worker'
import { FileWorkers } from './file.worker'

export const fileWorkers = async (job: Job) => {
  const handler = FileWorkers[job.name]

  if (handler) {
    console.log(`Processing job: ${job.name}`)
    await handler(job.data)
  }
}

export const callbackWorkers = async (job: Job) => {
  const handler = CallbacksWorkers[job.name]

  if (handler) {
    console.log(`Processing job: ${job.name}`)
    await handler(job.data)
  }
}
