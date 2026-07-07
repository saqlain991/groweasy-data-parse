import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { spawnSync } from 'child_process';
import { env } from './config/env';
import { logger } from './utils/logger';
import importRouter from './routes/import';

const app = express();

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
const allowAll = allowedOrigins.includes('*');

function isOriginAllowed(origin: string): boolean {
  return allowedOrigins.some(allowed => {
    if (allowed === origin) return true;
    // Wildcard subdomain: https://*.vercel.app matches https://foo.vercel.app
    if (allowed.startsWith('https://*.')) {
      const suffix = allowed.slice('https://*.'.length);
      return origin.startsWith('https://') && origin.endsWith('.' + suffix);
    }
    return false;
  });
}

const corsOptions: cors.CorsOptions = {
  origin: allowAll
    ? '*'
    : (origin, cb) => {
        // No Origin header = server-to-server or same-origin — allow
        if (!origin) return cb(null, true);
        // Return cb(null, false) — NOT cb(error) — to avoid Express 500 on preflight
        cb(null, isOriginAllowed(origin));
      },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: !allowAll,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/api/import', importRouter);

// Central error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', err.message);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Internal server error' } });
});

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
    logger.info(`Health: http://localhost:${env.PORT}/api/health`);
    if (!env.GEMINI_API_KEY) {
      logger.warn('GEMINI_API_KEY not set — AI imports will fail. Add it to backend/.env');
    }
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && attempt < 1) {
      logger.warn(`Port ${env.PORT} in use — killing existing process and retrying…`);
      killPort(env.PORT);
      setTimeout(() => startServer(attempt + 1), 1500);
    } else {
      logger.error(`Port ${env.PORT} is still in use after kill attempt. Free it manually and retry.`);
      process.exit(1);
    }
  });
}

startServer();

export default app;
