import { describe, it, expect, vi } from 'vitest';
import { backoff } from '../utils/backoff';

describe('backoff()', () => {
  it('returns the result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await backoff(fn, { retries: 3, base: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on rate-limit errors and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('429 rate limit'))
      .mockRejectedValueOnce(new Error('503 overload'))
      .mockResolvedValue('success');
    const result = await backoff(fn, { retries: 3, base: 0 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('429 rate limit'));
    await expect(backoff(fn, { retries: 2, base: 0 })).rejects.toThrow('429');
    expect(fn).toHaveBeenCalledTimes(3); // 1 attempt + 2 retries
  });

  it('does not retry non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Invalid API key'));
    await expect(backoff(fn, { retries: 3, base: 0 })).rejects.toThrow('Invalid API key');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('re-throws the last error after all retries', async () => {
    let attempt = 0;
    const fn = vi.fn().mockImplementation(() => {
      attempt++;
      return Promise.reject(new Error(`rate limit attempt ${attempt}`));
    });
    const err = await backoff(fn, { retries: 2, base: 0 }).catch((e: unknown) => e as Error);
    expect(err.message).toBe('rate limit attempt 3');
  });
});
