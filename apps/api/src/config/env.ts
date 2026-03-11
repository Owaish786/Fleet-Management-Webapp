import { resolve } from 'node:path'

import dotenv from 'dotenv'

import { z } from 'zod'

dotenv.config({
  path: resolve(process.cwd(), '../../.env'),
})

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32),
})

export const env = envSchema.parse(process.env)