import { describe, it, expect } from 'vitest';
import { parseCsvBuffer } from '../services/csv.service';

function buf(s: string) { return Buffer.from(s, 'utf-8'); }

describe('parseCsvBuffer()', () => {
  it('parses a simple CSV', () => {
    const csv = 'name,email\nAlice,alice@test.com\nBob,bob@test.com';
    const rows = parseCsvBuffer(buf(csv));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: 'Alice', email: 'alice@test.com' });
    expect(rows[1]).toEqual({ name: 'Bob',   email: 'bob@test.com' });
  });

  it('skips blank lines', () => {
    const csv = 'name,email\nAlice,alice@test.com\n\nBob,bob@test.com\n';
    const rows = parseCsvBuffer(buf(csv));
    expect(rows).toHaveLength(2);
  });

  it('handles quoted fields with commas', () => {
    const csv = 'name,address\n"Smith, John","123 Main St, NY"';
    const rows = parseCsvBuffer(buf(csv));
    expect(rows[0].name).toBe('Smith, John');
    expect(rows[0].address).toBe('123 Main St, NY');
  });

  it('returns empty array for header-only CSV', () => {
    const csv = 'name,email,phone';
    const rows = parseCsvBuffer(buf(csv));
    expect(rows).toHaveLength(0);
  });

  it('handles windows-style line endings', () => {
    const csv = 'name,email\r\nAlice,a@test.com\r\nBob,b@test.com';
    const rows = parseCsvBuffer(buf(csv));
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('Alice');
  });

  it('preserves all columns from header', () => {
    const csv = 'col1,col2,col3\nv1,v2,v3';
    const rows = parseCsvBuffer(buf(csv));
    expect(Object.keys(rows[0])).toEqual(['col1', 'col2', 'col3']);
  });
});
