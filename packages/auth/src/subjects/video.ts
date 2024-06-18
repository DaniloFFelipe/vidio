import { z } from 'zod'

import { videoSchema } from '../models/video'

export const videoSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Video'), videoSchema]),
])

export type VideoSubject = z.infer<typeof videoSubject>
