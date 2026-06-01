import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('AI 로그라이크 던전 RPG'),
  VITE_ANTHROPIC_API_KEY: z.string().min(1),
  VITE_SUPABASE_URL: z.string().min(1),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables. Check .env file.');
}

export const env = parsed.data;
export type Env = typeof env;
