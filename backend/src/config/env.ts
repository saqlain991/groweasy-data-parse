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

const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GROQ_API_KEY: z.string().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  AI_BATCH_SIZE: z.string().default('20').transform(Number),
  AI_MAX_CONCURRENCY: z.string().default('2').transform(Number),
  AI_MAX_RETRIES: z.string().default('3').transform(Number),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);
