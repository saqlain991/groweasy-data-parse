import express, { Request, Response, NextFunction } from 'express';
import { spawnSync } from 'child_process';
import { env } from './config/env';
import { logger } from './utils/logger';
import importRouter from './routes/import';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
const allowAll = allowedOrigins.includes('*');

function isOriginAllowed(origin: string): boolean {
  return allowedOrigins.some(allowed => {
    if (allowed === origin) return true;
    // Wildcard subdomain: https://*.vercel.app → matches https://anything.vercel.app
    if (allowed.startsWith('https://*.')) {
      const suffix = '.' + allowed.slice('https://*.'.length); // e.g. ".vercel.app"
      return origin.startsWith('https://') && origin.endsWith(suffix);
    }
    return false;
  });
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (allowAll) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // cache preflight for 24h

  // Respond to OPTIONS preflight immediately — no further processing needed
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

// ─── Body parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/api/import', importRouter);

// ─── Error handler ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', err.message);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Internal server error' } });
});

// ─── Server startup ───────────────────────────────────────────────────────────

function killPort(port: number): void {
  if (process.platform === 'win32') {
    spawnSync('powershell', [
      '-NoProfile', '-NonInteractive', '-Command',
      `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }`,
    ], { stdio: 'pipe' });
  } else {
    spawnSync('sh', ['-c', `lsof -ti:${port} | xargs kill -9`], { stdio: 'pipe' });
  }
}

function startServer(attempt = 0): void {
  const server = app.listen(env.PORT, () => {
    logger.info(`GrowEasy backend running on port ${env.PORT}`);
    logger.info(`Allowed origins: ${env.ALLOWED_ORIGINS}`);
    if (!env.GEMINI_API_KEY && !env.GROQ_API_KEY) {
      logger.warn('No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY.');
    }
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && attempt < 1) {
      logger.warn(`Port ${env.PORT} in use — killing existing process and retrying…`);
      killPort(env.PORT);
      setTimeout(() => startServer(attempt + 1), 1500);
    } else {
      logger.error(`Port ${env.PORT} is still in use after kill attempt.`);
      process.exit(1);
    }
  });
}

startServer();

export default app;
