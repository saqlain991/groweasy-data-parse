import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Manual .env loader (no dotenv dependency)
function loadDotEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = value;
          }
        }
      }
    }
  } catch { /* ignore */ }
}

loadDotEnv();

// Each entry must be * or a valid http/https URL (including wildcard subdomain patterns)
const validOrigin = (o: string) =>
  o === '*' || /^https?:\/\/.+/.test(o);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),

  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  GROQ_API_KEY: z.string().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),

  AI_BATCH_SIZE: z.string().default('20').transform(Number),
  AI_MAX_CONCURRENCY: z.string().default('2').transform(Number),
  AI_MAX_RETRIES: z.string().default('3').transform(Number),

  // Comma-separated list of allowed CORS origins.
  // Default includes the production Vercel URL + localhost for local dev.
  // Override via ALLOWED_ORIGINS env var on Render (or any host).
  // Use * to allow all origins, or https://*.vercel.app for all Vercel previews.
  ALLOWED_ORIGINS: z
    .string()
    .default('*')
    .transform(val =>
      val
        .split(',')
        .map(o => o.trim())
        .filter(Boolean)
        .join(',')
    )
    .refine(
      val => val.split(',').every(validOrigin),
      { message: 'ALLOWED_ORIGINS must be * or comma-separated HTTP/HTTPS URLs (e.g. https://app.vercel.app)' }
    ),
});

export const env = envSchema.parse(process.env);

if (env.ALLOWED_ORIGINS.split(',').includes('*') && env.NODE_ENV === 'production') {
  console.warn(
    '[env] ALLOWED_ORIGINS=* in production allows all origins. ' +
    'Set specific URLs in ALLOWED_ORIGINS for better security.'
  );
}
