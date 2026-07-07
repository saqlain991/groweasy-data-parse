import type { Request, Response } from 'express';
import { parseCsvBuffer } from '../services/csv.service';
import { extractAll } from '../services/ai.service';
import { finalize } from '../services/mapping.service';
import type { CrmRecord, SkippedRecord, ImportResponse } from '../schema/crm.schema';
import { logger } from '../utils/logger';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function parseRows(req: Request): Record<string, string>[] | null {
  if (req.file) return parseCsvBuffer(req.file.buffer);
  if (req.body?.rows && Array.isArray(req.body.rows)) return req.body.rows as Record<string, string>[];
  return null;
}

function buildResponse(batchResults: Awaited<ReturnType<typeof extractAll>>, totalRows: number): ImportResponse {
  const imported: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];
  let rowIndex = 0;
  for (const batchResult of batchResults) {
    if (batchResult.ok) {
      for (const rawRecord of batchResult.records) {
        const { record, skip } = finalize(rawRecord, rowIndex);
        if (record) imported.push(record);
        else if (skip) skipped.push(skip);
        rowIndex++;
      }
    }
  }
  return {
    totals: { received: totalRows, imported: imported.length, skipped: skipped.length },
    imported,
    skipped,
  };
}

// ─── Standard JSON import ─────────────────────────────────────────────────────

export async function handleImport(req: Request, res: Response): Promise<void> {
  try {
    const rows = parseRows(req);
    if (!rows) {
      res.status(400).json({ error: { code: 'BAD_CSV', message: 'Provide a CSV file or rows array' } });
      return;
    }
    if (rows.length === 0) {
      res.status(400).json({ error: { code: 'EMPTY_FILE', message: 'CSV file is empty' } });
      return;
    }
    logger.info(`Import request: ${rows.length} rows`);
    const batchResults = await extractAll(rows as Record<string, unknown>[]);
    const response = buildResponse(batchResults, rows.length);
    logger.info(`Import complete: ${response.totals.imported} imported, ${response.totals.skipped} skipped`);
    res.json(response);
  } catch (e: unknown) {
    logger.error('Import error', e);
    const msg = String(e).includes('GEMINI_API_KEY')
      ? 'AI service not configured. Set GEMINI_API_KEY in backend/.env'
      : 'AI service temporarily unavailable. Please try again.';
    res.status(503).json({ error: { code: 'AI_UNAVAILABLE', message: msg } });
  }
}

// ─── SSE streaming import ─────────────────────────────────────────────────────

export async function handleImportStream(req: Request, res: Response): Promise<void> {
  const rows = parseRows(req);
  if (!rows || rows.length === 0) {
    res.status(400).json({ error: { code: 'BAD_CSV', message: 'Provide a CSV file or rows array' } });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Heartbeat to keep the connection alive through proxies
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15_000);

  try {
    send('start', { total: rows.length });

    const batchResults = await extractAll(
      rows as Record<string, unknown>[],
      (evt) => send(evt.type, evt),
    );

    const response = buildResponse(batchResults, rows.length);
    send('done', response);
  } catch (e: unknown) {
    logger.error('Stream import error', e);
    send('error', { message: String(e) });
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
}
