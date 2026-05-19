import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    GOOGLE_PLACES_API_KEY: z.string().optional(),
    SENDGRID_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().email().optional(),
  },
  experimental__runtimeEnv: process.env,
})
