import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { spawnSync } from 'child_process';
import { env } from './config/env';
import { logger } from './utils/logger';
import importRouter from './routes/import';

const app = express();

app.use(cors({
  origin: env.ALLOWED_ORIGINS.split(',').map(o => o.trim()),
  methods: ['GET', 'POST'],
}));
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
