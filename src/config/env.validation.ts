import { z } from 'zod';

export const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // CORS
  CORS_ORIGIN: z.string().optional(),
  
  // Socket.io
  SOCKET_CORS_ORIGIN: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>): EnvConfig => {
  const result = envSchema.safeParse(config);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.errors.forEach((error) => {
      console.error(`  - ${error.path.join('.')}: ${error.message}`);
    });
    process.exit(1);
  }
  
  // Environment variables validated successfully
  return result.data;
};
