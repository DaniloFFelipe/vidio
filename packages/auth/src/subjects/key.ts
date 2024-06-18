import { z } from 'zod'

import { keySchema } from '../models/key'

export const keySubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Key'), keySchema]),
])

export type KeySubject = z.infer<typeof keySubject>
