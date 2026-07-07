export async function backoff<T>(
  fn: () => Promise<T>,
  { retries = 3, base = 800 }: { retries?: number; base?: number } = {}
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      const retryable = String(e).match(/429|500|502|503|overload|rate/i);
      if (!retryable || attempt === retries) break;
      const wait = base * 2 ** attempt + Math.random() * 300;
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw lastErr;
}
