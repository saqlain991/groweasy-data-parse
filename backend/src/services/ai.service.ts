import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/extract.prompt';
import { crmArraySchema } from '../schema/crm.gemini-schema';
import { env } from '../config/env';
import { backoff } from '../utils/backoff';
import { logger } from '../utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeminiModel = any;

// ─── Gemini ───────────────────────────────────────────────────────────────────

let geminiInstance: GeminiModel | null = null;

function getGeminiModel(): GeminiModel {
  if (!geminiInstance) {
    if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    geminiInstance = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responseSchema: crmArraySchema as any,
      },
    });
  }
  return geminiInstance;
}

async function extractWithGemini(rows: Record<string, unknown>[]): Promise<Record<string, string>[]> {
  const model = getGeminiModel();
  const res = await model.generateContent(buildUserPrompt(rows));
  const text = res.response.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Gemini did not return an array');
  return parsed as Record<string, string>[];
}

// ─── Groq ─────────────────────────────────────────────────────────────────────

let groqInstance: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqInstance) {
    if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');
    groqInstance = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groqInstance;
}

// Groq json_object mode requires a top-level object, not an array.
// We instruct the model to wrap the result as { "records": [...] }.
const GROQ_SYSTEM_PROMPT = SYSTEM_PROMPT.replace(
  /OUTPUT:.*$/s,
  'OUTPUT: a JSON object with a single key "records" whose value is an array with EXACTLY one object per input row, in the SAME ORDER.',
);

function buildGroqUserPrompt(rows: Record<string, unknown>[]): string {
  return `Map these ${rows.length} rows. Return a JSON object: { "records": [ ...${rows.length} objects... ] }, same order.\n\nROWS:\n${JSON.stringify(rows)}`;
}

async function extractWithGroq(rows: Record<string, unknown>[]): Promise<Record<string, string>[]> {
  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model: env.GROQ_MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: GROQ_SYSTEM_PROMPT },
      { role: 'user',   content: buildGroqUserPrompt(rows) },
    ],
  });
  const text = completion.choices[0]?.message?.content ?? '';
  const parsed = JSON.parse(text);
  // Accept { records: [...] }, { data: [...] }, { leads: [...] }, or bare array
  const arr: unknown =
    parsed.records ?? parsed.data ?? parsed.leads ??
    (Array.isArray(parsed) ? parsed : Object.values(parsed).find(Array.isArray));
  if (!Array.isArray(arr)) throw new Error('Groq did not return a parseable array');
  return arr as Record<string, string>[];
}

// ─── Batch extraction (Gemini → Groq fallback) ────────────────────────────────

async function extractBatch(rows: Record<string, unknown>[]): Promise<Record<string, string>[]> {
  // 1. Try Gemini with retries
  if (env.GEMINI_API_KEY) {
    try {
      return await backoff(() => extractWithGemini(rows), { retries: env.AI_MAX_RETRIES });
    } catch (e) {
      logger.warn(`Gemini failed — trying Groq fallback: ${String(e)}`);
    }
  }

  // 2. Fallback to Groq
  if (env.GROQ_API_KEY) {
    return backoff(() => extractWithGroq(rows), { retries: env.AI_MAX_RETRIES });
  }

  throw new Error('No AI provider available. Set GEMINI_API_KEY or GROQ_API_KEY in backend/.env');
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function pool<T, R>(items: T[], limit: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type BatchResult =
  | { ok: true;  records: Record<string, string>[] }
  | { ok: false; batch:   Record<string, unknown>[] };

export type ProgressEvent =
  | { type: 'batch_start';    batchIndex: number; totalBatches: number; rowCount: number }
  | { type: 'batch_done';     batchIndex: number; totalBatches: number; imported: number; retried: boolean }
  | { type: 'batch_retry';    batchIndex: number; attempt: number }
  | { type: 'row_fallback';   batchIndex: number; rowsLeft: number };

export async function extractAll(
  rows: Record<string, unknown>[],
  onProgress?: (event: ProgressEvent) => void,
): Promise<BatchResult[]> {
  const batches = chunk(rows, env.AI_BATCH_SIZE);
  logger.info(`Processing ${rows.length} rows in ${batches.length} batches`);

  return pool(batches, env.AI_MAX_CONCURRENCY, async (batch, i) => {
    onProgress?.({ type: 'batch_start', batchIndex: i, totalBatches: batches.length, rowCount: batch.length });
    try {
      logger.info(`Batch ${i + 1}/${batches.length}: extracting ${batch.length} rows`);
      const records = await extractBatch(batch);
      onProgress?.({ type: 'batch_done', batchIndex: i, totalBatches: batches.length, imported: records.length, retried: false });
      return { ok: true as const, records };
    } catch (e) {
      logger.warn(`Batch ${i + 1} failed — trying single-record fallback: ${String(e)}`);
      onProgress?.({ type: 'row_fallback', batchIndex: i, rowsLeft: batch.length });
      const fallbackRecords: Record<string, string>[] = [];
      for (const row of batch) {
        try {
          const [rec] = await extractBatch([row]);
          fallbackRecords.push(rec);
        } catch {
          fallbackRecords.push({} as Record<string, string>);
        }
      }
      onProgress?.({ type: 'batch_done', batchIndex: i, totalBatches: batches.length, imported: fallbackRecords.length, retried: true });
      return { ok: true as const, records: fallbackRecords };
    }
  });
}
