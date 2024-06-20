import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3333),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_HOST: z.string(),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
  },
  client: {},
  shared: {},
  runtimeEnv: {
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    PORT: process.env.SERVER_PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  emptyStringAsUndefined: true,
})
