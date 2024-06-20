import { Callbacks } from '@prisma/client'
import axios from 'axios'

export const CallbacksWorkers: Record<
  string,
  (data: Callbacks & { payload: unknown }) => Promise<void>
> = {
  sendCallback: async ({ url, payload }) => {
    try {
      await axios.post(url, { data: payload })
    } catch {}
  },
}
