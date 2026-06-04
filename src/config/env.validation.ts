import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Database
  PORT: z.coerce.number().default(8080),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string().min(1).default('postgres'),
  DB_PASSWORD: z.string().min(1).default('123456'),
  DB_NAME: z.string().min(1).default('ecommerce'),

  // Throttler
  THROTTLE_TTL_MS: z.coerce.number().default(1000),
  THROTTLE_LIMIT: z.coerce.number().default(60),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => ` - ${issue.path.join('.')} : ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid enviroment configuration:\n${issues}`);
  }

  return parsed.data;
}
