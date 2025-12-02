// src/config.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url().min(1),
  PRICING_BASE_URL: z.string().url().min(1),
  USE_INMEMORY: z.enum(['true', 'false']).transform((v) => v === 'true').default(false),
});

const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  pricingBaseUrl: env.PRICING_BASE_URL,
  useInMemory: env.USE_INMEMORY,
} as const;

export type Config = typeof config;
