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
  AWS_REGION: z.string().min(1).optional(),
  AWS_S3_ANALYTICS_BUCKET: z.string().min(3).optional(),
  AWS_S3_LOGS_BUCKET: z.string().min(3).optional(),
  AWS_LAMBDA_ANALYTICS_FUNCTION: z.string().min(1).optional(),
})

export const env = envSchema.parse(process.env)