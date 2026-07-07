import type { Request, Response } from 'express';
import { parseCsvBuffer } from '../services/csv.service';
import { extractAll } from '../services/ai.service';
import { finalize } from '../services/mapping.service';
import type { CrmRecord, SkippedRecord, ImportResponse } from '../schema/crm.schema';
import { logger } from '../utils/logger';

export async function handleImport(req: Request, res: Response): Promise<void> {
  try {
    let rows: Record<string, string>[];

    if (req.file) {
      rows = parseCsvBuffer(req.file.buffer);
    } else if (req.body?.rows && Array.isArray(req.body.rows)) {
      rows = req.body.rows as Record<string, string>[];
    } else {
      res.status(400).json({ error: { code: 'BAD_CSV', message: 'Provide a CSV file or rows array' } });
      return;
    }

    if (rows.length === 0) {
      res.status(400).json({ error: { code: 'EMPTY_FILE', message: 'CSV file is empty' } });
      return;
    }

    logger.info(`Import request: ${rows.length} rows`);

    const batchResults = await extractAll(rows as Record<string, unknown>[]);

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

    const response: ImportResponse = {
      totals: { received: rows.length, imported: imported.length, skipped: skipped.length },
      imported,
      skipped,
    };

    logger.info(`Import complete: ${imported.length} imported, ${skipped.length} skipped`);
    res.json(response);

  } catch (e: unknown) {
    logger.error('Import error', e);
    const msg = String(e).includes('GEMINI_API_KEY')
      ? 'AI service not configured. Set GEMINI_API_KEY in backend/.env'
      : 'AI service temporarily unavailable. Please try again.';
    res.status(503).json({ error: { code: 'AI_UNAVAILABLE', message: msg } });
  }
}
